package doenit.app;

import android.os.Bundle;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;
import java.util.Set;

public class MainActivity extends BridgeActivity {
    
    private static final Set<String> ALLOWED_ROUTES = Set.of(
        "/create", "/", "/settings"
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register plugins
        registerPlugin(TaskWidgetPlugin.class);

        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);

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
        android.util.Log.d("MainActivity", "Intent received with route: " + route);
        
        if (route != null && ALLOWED_ROUTES.contains(route)) {
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
        } else if (route != null) {
            android.util.Log.w("MainActivity", "Attempted navigation to unauthorized route: " + route);
        }
    }
}