package com.kingdriver.sabara;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    WebView web = new WebView(this);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setGeolocationEnabled(true);
    web.setWebViewClient(new WebViewClient());
    web.loadUrl("https://luizclaudiosilvacirilo.github.io/king-driver/");
    setContentView(web);
  }
}
