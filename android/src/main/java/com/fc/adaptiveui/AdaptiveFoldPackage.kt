package com.fc.adaptiveui

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class AdaptiveFoldPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == AdaptiveFoldModule.NAME) AdaptiveFoldModule(reactContext) else null

  // Arguments are positional because ReactModuleInfo's parameter names differ between React Native 0.76 and later.
  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    val canOverrideExistingModule = false
    val needsEagerInit = false
    val isCxxModule = false
    val isTurboModule = true
    mapOf(
      AdaptiveFoldModule.NAME to
        ReactModuleInfo(
          AdaptiveFoldModule.NAME,
          AdaptiveFoldModule::class.java.name,
          canOverrideExistingModule,
          needsEagerInit,
          isCxxModule,
          isTurboModule,
        )
    )
  }
}
