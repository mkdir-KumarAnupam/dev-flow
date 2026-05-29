package com.example.focuscompanion

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.focuscompanion.theme.FocusCompanionTheme
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import org.json.JSONObject

class WebAppInterface(private val mContext: Context) {
    @JavascriptInterface
    fun showToast(toast: String) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun sendCommand(command: String) {
        try {
            val databaseCmd = com.google.firebase.database.FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/commands")
            val cmdObj = java.util.HashMap<String, Any>()
            cmdObj["command"] = command
            cmdObj["timestamp"] = System.currentTimeMillis()
            databaseCmd.setValue(cmdObj)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FocusCompanionTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CompanionApp(this)
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled", "AddJavascriptInterface")
@Composable
fun CompanionApp(context: Context) {
    var lastLiveJsonStr by remember { mutableStateOf<String?>(null) }
    var lastReportJsonStr by remember { mutableStateOf<String?>(null) }
    var isPageFinished by remember { mutableStateOf(false) }

    val webView = remember {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            addJavascriptInterface(WebAppInterface(context), "Android")
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    isPageFinished = true
                }
            }
            loadUrl("file:///android_asset/companion.html")
        }
    }

    LaunchedEffect(lastLiveJsonStr, isPageFinished) {
        if (isPageFinished && lastLiveJsonStr != null) {
            webView.evaluateJavascript("if (window.updateFocusLive) { window.updateFocusLive('$lastLiveJsonStr'); }", null)
        }
    }

    LaunchedEffect(lastReportJsonStr, isPageFinished) {
        if (isPageFinished && lastReportJsonStr != null) {
            webView.evaluateJavascript("if (window.updateFocusReport) { window.updateFocusReport('$lastReportJsonStr'); }", null)
        }
    }

    DisposableEffect(Unit) {
        try { com.google.firebase.FirebaseApp.initializeApp(context) } catch (e: Exception) {}
        val databaseLive = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/liveSession")
        val listenerLive = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                try {
                    val jsonObj = JSONObject()
                    if (snapshot.exists()) {
                        for (child in snapshot.children) {
                            val value = child.value
                            if (value != null) {
                                jsonObj.put(child.key.toString(), value)
                            }
                        }
                    } else {
                        jsonObj.put("active", false)
                    }
                    lastLiveJsonStr = jsonObj.toString().replace("'", "\\'")
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        databaseLive.addValueEventListener(listenerLive)

        val databaseReport = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/lastReport")
        val listenerReport = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                try {
                    val jsonObj = JSONObject()
                    if (snapshot.exists()) {
                        for (child in snapshot.children) {
                            val value = child.value
                            if (value != null) {
                                jsonObj.put(child.key.toString(), value)
                            }
                        }
                    }
                    lastReportJsonStr = jsonObj.toString().replace("'", "\\'")
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        databaseReport.addValueEventListener(listenerReport)

        onDispose {
            databaseLive.removeEventListener(listenerLive)
            databaseReport.removeEventListener(listenerReport)
        }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { webView }
    )
}
