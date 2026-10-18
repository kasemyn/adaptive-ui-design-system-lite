package com.fc.adaptiveui

import android.app.Activity
import android.os.Handler
import android.os.Looper
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executor

class AdaptiveFoldModule(reactContext: ReactApplicationContext) :
  NativeAdaptiveFoldSpec(reactContext), LifecycleEventListener {

  private val mainThreadExecutor = Executor { Handler(Looper.getMainLooper()).post(it) }
  private val windowLayoutInfoListener = Consumer<WindowLayoutInfo> { emitWindowLayout(it) }

  private var observedActivity: Activity? = null
  private var observedWindowInfoTracker: WindowInfoTrackerCallbackAdapter? = null

  @Volatile private var latestWindowLayout: WindowLayoutSnapshot? = null

  init {
    reactContext.addLifecycleEventListener(this)
    observe(reactContext.currentActivity)
  }

  override fun getName(): String = NAME

  override fun getCurrentWindowLayout(): WritableMap? = latestWindowLayout?.toWritableMap()

  override fun onHostResume() {
    observe(reactApplicationContext.currentActivity)
  }

  override fun onHostPause() {
    stopObserving()
  }

  override fun onHostDestroy() {
    stopObserving()
  }

  override fun invalidate() {
    stopObserving()
    reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  // Observing the Activity (not the module) matters: the listener must follow the Activity that
  // is actually on screen, and must never outlive it.
  private fun observe(activity: Activity?) {
    if (activity == null || activity === observedActivity) {
      return
    }
    stopObserving()
    val windowInfoTracker = WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(activity))
    windowInfoTracker.addWindowLayoutInfoListener(
      activity,
      mainThreadExecutor,
      windowLayoutInfoListener,
    )
    observedActivity = activity
    observedWindowInfoTracker = windowInfoTracker
  }

  private fun stopObserving() {
    observedWindowInfoTracker?.removeWindowLayoutInfoListener(windowLayoutInfoListener)
    observedWindowInfoTracker = null
    observedActivity = null
  }

  private fun emitWindowLayout(windowLayoutInfo: WindowLayoutInfo) {
    val activity = observedActivity ?: return
    val windowLayout = WindowLayoutSnapshot.from(activity, windowLayoutInfo)
    latestWindowLayout = windowLayout
    emitOnWindowLayoutChange(windowLayout.toWritableMap())
  }

  companion object {
    const val NAME = "AdaptiveFold"
  }
}
