#import <React/RCTBridgeModule.h>
#import <AppKit/AppKit.h>

@interface FilePickerModule : NSObject <RCTBridgeModule>
@end

@implementation FilePickerModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_METHOD(openFilePicker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    [panel setTitle:@"Choose a .lottie file"];
    [panel setAllowsMultipleSelection:NO];
    [panel setCanChooseDirectories:NO];
    [panel setCanChooseFiles:YES];
    [panel setAllowsOtherFileTypes:NO];
    
    // Restrict to .lottie files only
    [panel setAllowedFileTypes:@[@"lottie"]];
    
    NSInteger result = [panel runModal];
    
    if (result == NSModalResponseOK) {
      NSURL *url = [[panel URLs] firstObject];
      if (url) {
        // Return the absolute file path
        // Since we've restricted to .lottie files only, we don't need to check extension again
        NSString *filePath = [url path];
        NSLog(@"Selected file path: %@", filePath);
        resolve(filePath);
      } else {
        NSError *error = [NSError errorWithDomain:@"FilePickerModule" 
                                             code:2 
                                         userInfo:@{NSLocalizedDescriptionKey: @"No file selected"}];
        reject(@"NO_FILE", @"No file selected", error);
      }
    } else {
      // User cancelled
      resolve(nil);
    }
  });
}

@end
