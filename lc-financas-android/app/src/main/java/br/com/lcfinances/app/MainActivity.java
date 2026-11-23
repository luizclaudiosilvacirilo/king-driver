package br.com.lcfinances.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView webView;
    private TextToSpeech tts;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        tts = new TextToSpeech(this, status -> { if (status == TextToSpeech.SUCCESS) tts.setLanguage(new Locale("pt", "BR")); });
        webView.addJavascriptInterface(new AndroidTtsBridge(), "AndroidTtsBridge");
        if (state == null) webView.loadUrl("https://fp-emprestimos-zrw4ys.v2.appdeploy.ai/");
        else webView.restoreState(state);
    }

    private class AndroidTtsBridge {
        @JavascriptInterface public void speak(String text) {
            runOnUiThread(() -> { if (tts != null && text != null) tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lc-financas"); });
        }
        @JavascriptInterface public void stop() {
            runOnUiThread(() -> { if (tts != null) tts.stop(); });
        }
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); webView.saveState(out); }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
