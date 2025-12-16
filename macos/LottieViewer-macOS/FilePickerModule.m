#import <React/RCTBridgeModule.h>
#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>

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

RCT_EXPORT_METHOD(getFileSize:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (!filePath || [filePath length] == 0) {
    NSError *error = [NSError errorWithDomain:@"FilePickerModule"
                                         code:1
                                     userInfo:@{NSLocalizedDescriptionKey: @"Invalid file path"}];
    reject(@"INVALID_PATH", @"Invalid file path", error);
    return;
  }
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSError *error = nil;
  NSDictionary *attributes = [fileManager attributesOfItemAtPath:filePath error:&error];
  
  if (error) {
    reject(@"FILE_ERROR", [error localizedDescription], error);
    return;
  }
  
  NSNumber *fileSize = [attributes objectForKey:NSFileSize];
  if (fileSize) {
    // fileSize is already an NSNumber, pass it directly
    resolve(fileSize);
  } else {
    NSError *error = [NSError errorWithDomain:@"FilePickerModule"
                                         code:2
                                     userInfo:@{NSLocalizedDescriptionKey: @"Could not get file size"}];
    reject(@"SIZE_ERROR", @"Could not get file size", error);
  }
}

@end
