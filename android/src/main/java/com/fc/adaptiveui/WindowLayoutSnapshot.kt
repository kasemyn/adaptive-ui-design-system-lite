package com.fc.adaptiveui

import android.app.Activity
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowLayoutInfo
import androidx.window.layout.WindowMetricsCalculator
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil

internal data class FoldingFeatureSnapshot(
  val x: Double,
  val y: Double,
  val width: Double,
  val height: Double,
  val state: String,
  val orientation: String,
  val isSeparating: Boolean,
  val occlusionType: String,
) {
  fun toWritableMap(): WritableMap =
    Arguments.createMap().apply {
      putDouble("x", x)
      putDouble("y", y)
      putDouble("width", width)
      putDouble("height", height)
      putString("state", state)
      putString("orientation", orientation)
      putBoolean("isSeparating", isSeparating)
      putString("occlusionType", occlusionType)
    }

  companion object {
    fun from(feature: FoldingFeature): FoldingFeatureSnapshot {
      val bounds = feature.bounds
      return FoldingFeatureSnapshot(
        x = PixelUtil.toDIPFromPixel(bounds.left.toFloat()).toDouble(),
        y = PixelUtil.toDIPFromPixel(bounds.top.toFloat()).toDouble(),
        width = PixelUtil.toDIPFromPixel(bounds.width().toFloat()).toDouble(),
        height = PixelUtil.toDIPFromPixel(bounds.height().toFloat()).toDouble(),
        state = if (feature.state == FoldingFeature.State.HALF_OPENED) "halfOpened" else "flat",
        orientation =
          if (feature.orientation == FoldingFeature.Orientation.VERTICAL) "vertical" else "horizontal",
        isSeparating = feature.isSeparating,
        occlusionType =
          if (feature.occlusionType == FoldingFeature.OcclusionType.FULL) "full" else "none",
      )
    }
  }
}

/**
 * The window size travels with the folding features so JS can tell whether a fold report
 * belongs to the window it is currently laying out (the two arrive separately on unfold).
 */
internal data class WindowLayoutSnapshot(
  val windowWidth: Double,
  val windowHeight: Double,
  val foldingFeatures: List<FoldingFeatureSnapshot>,
) {
  fun toWritableMap(): WritableMap =
    Arguments.createMap().apply {
      putDouble("windowWidth", windowWidth)
      putDouble("windowHeight", windowHeight)
      putArray(
        "foldingFeatures",
        Arguments.createArray().apply { foldingFeatures.forEach { pushMap(it.toWritableMap()) } },
      )
    }

  companion object {
    fun from(activity: Activity, windowLayoutInfo: WindowLayoutInfo): WindowLayoutSnapshot {
      val windowBounds =
        WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(activity).bounds
      return WindowLayoutSnapshot(
        windowWidth = PixelUtil.toDIPFromPixel(windowBounds.width().toFloat()).toDouble(),
        windowHeight = PixelUtil.toDIPFromPixel(windowBounds.height().toFloat()).toDouble(),
        foldingFeatures =
          windowLayoutInfo.displayFeatures
            .filterIsInstance<FoldingFeature>()
            .map(FoldingFeatureSnapshot::from),
      )
    }
  }
}
