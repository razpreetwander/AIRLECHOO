package com.example.gemini.ui.echoo

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.webkit.*
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.example.gemini.MainActivity
import com.example.gemini.data.daemon.TermuxDaemonManager
import com.example.gemini.data.local.LocalTerminalBridge

class EchooAndroidBridge(
    private val context: Context,
    private val webView: WebView,
    private val onOpenNativeTerminal: () -> Unit
) {
    @JavascriptInterface
    fun getAuthToken(): String {
        return try {
            val tokenFile = java.io.File(context.filesDir.parentFile, "home/.antigem_bridge/csrf_token.txt")
            if (tokenFile.exists()) tokenFile.readText().trim() else "mc6johzi7t8l"
        } catch (e: Exception) {
            "mc6johzi7t8l"
        }
    }

    @JavascriptInterface
    fun getBridgePort(): Int = 1234

    @JavascriptInterface
    fun getHubPort(): Int = 1235

    @JavascriptInterface
    fun getTerminalPort(): Int = 1236

    @JavascriptInterface
    fun openNativeTerminal() {
        (context as? MainActivity)?.runOnUiThread {
            onOpenNativeTerminal()
        }
    }

    @JavascriptInterface
    fun execTermuxCommand(command: String): String {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val stdout = process.inputStream.bufferedReader().readText()
            val stderr = process.errorStream.bufferedReader().readText()
            val code = process.waitFor()
            org.json.JSONObject().apply {
                put("exit_code", code)
                put("stdout", stdout)
                put("stderr", stderr)
                put("command", command)
            }.toString()
        } catch (e: Exception) {
            org.json.JSONObject().apply {
                put("exit_code", 1)
                put("stdout", "")
                put("stderr", e.message ?: "Execution error")
                put("command", command)
            }.toString()
        }
    }

    @JavascriptInterface
    fun showToast(msg: String) {
        (context as? MainActivity)?.runOnUiThread {
            MainActivity.showToast(msg)
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EchooScreen(
    onNavigateToTerminal: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    BackHandler(enabled = true) {
        webViewRef?.let { wv ->
            wv.evaluateJavascript(
                """
                (function() {
                    if (window.pages && window.pages.length > 0) {
                        window.closePage();
                        return true;
                    }
                    var sheet = document.getElementById('sheetBg');
                    if (sheet && sheet.classList.contains('show')) {
                        window.closeSheet();
                        return true;
                    }
                    var sb = document.getElementById('sidebar');
                    if (sb && !sb.classList.contains('closed') && window.innerWidth <= 768) {
                        window.setSide(true);
                        return true;
                    }
                    return false;
                })()
                """.trimIndent()
            ) { result ->
                if (result != "true") {
                    if (wv.canGoBack()) {
                        wv.goBack()
                    } else {
                        (context as? MainActivity)?.finish()
                    }
                }
            }
        }
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                webViewRef = this
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    mediaPlaybackRequiresUserGesture = false
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    setSupportZoom(false)
                    cacheMode = WebSettings.LOAD_DEFAULT
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }

                // Add bridge interface
                addJavascriptInterface(
                    EchooAndroidBridge(ctx, this, onNavigateToTerminal),
                    "AndroidBridge"
                )

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url?.toString() ?: return false
                        if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost") || url.startsWith("file:///android_asset")) {
                            return false
                        }
                        try {
                            ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                            return true
                        } catch (e: Exception) {
                            return false
                        }
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onPermissionRequest(request: PermissionRequest?) {
                        request?.grant(request.resources)
                    }

                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        android.util.Log.d("EchooWebView", "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                        return true
                    }
                }

                // Load embedded Echoo UI
                loadUrl("file:///android_asset/web/index.html")
            }
        },
        update = { wv ->
            webViewRef = wv
        }
    )
}
