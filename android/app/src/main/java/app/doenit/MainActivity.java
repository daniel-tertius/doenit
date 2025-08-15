package doenit.app;

import android.os.Bundle;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import java.util.Set;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register plugins
        registerPlugin(TaskWidgetPlugin.class);

        super.onCreate(savedInstanceState);

        // Handle intent
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        String route = intent.getStringExtra("route");
        Log.d("Doenit - MainActivity", "Intent received with route: " + route);
        
        if (route != "null" && route != null && !route.isEmpty()) {
            // Wait for the web view to be ready
            if (getBridge() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        "if (window.location && window.location.pathname !== '" + route + "') { " +
                        "  window.location.href = '" + route + "'; " +
                        "}", null
                    );
                });
            }
        }
    }
}