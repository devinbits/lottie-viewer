#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

static NSString *pendingOpenFile = nil;

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"LottieViewer";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  NSMutableDictionary *initProps = [NSMutableDictionary new];
  if (pendingOpenFile) {
    initProps[@"fileToOpen"] = pendingOpenFile;
  }
  self.initialProps = initProps;
  self.dependencyProvider = [RCTAppDependencyProvider new];
  
  return [super applicationDidFinishLaunching:notification];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

- (BOOL)application:(NSApplication *)sender openFile:(NSString *)filename {
  pendingOpenFile = filename;
  if (self.bridge) {
    [self.bridge.eventDispatcher sendAppEventWithName:@"openFile" body:@{@"url": filename}];
  }
  return YES;
}

@end
