import Foundation
import Sparkle

var isCheckForUpdatesInBackground = false
// MARK: - 自定义用户界面驱动

final class CustomUserDriver: NSObject, SPUUserDriver {
    private var downloadSize: UInt64 = 0
    private var currentProgress: UInt64 = 0
    
    private var notificationWindow: UpdateNotificationWindow?
    private var installType: Int = 0
    
    private func ensureNotificationWindow() -> UpdateNotificationWindow {
           if notificationWindow == nil {
               notificationWindow = UpdateNotificationWindow()
           }
           return notificationWindow!
       }
    
    func show(_ request: SPUUpdatePermissionRequest, reply: @escaping (SUUpdatePermissionResponse) -> Void) {
//        LoggerManager.shared.loggerInfo("show:::: ")
    }
    
    // 检查更新
    func showUserInitiatedUpdateCheck(cancellation: @escaping () -> Void) {
        LoggerManager.shared.loggerInfo("showUserInitiatedUpdateCheck:::: \(isCheckForUpdatesInBackground) ")
        if !isCheckForUpdatesInBackground {
            ensureNotificationWindow().showChecking {
                cancellation()
            }
        }
       
    }
    
    func showUpdateReleaseNotes(with downloadData: SPUDownloadData) {
//        LoggerManager.shared.loggerInfo("showUpdateReleaseNotes:::: ")
    }
    
    func showUpdateReleaseNotesFailedToDownloadWithError(_ error: any Error) {
//        LoggerManager.shared.loggerInfo("showUpdateReleaseNotesFailedToDownloadWithError:::: ")
    }
    
    // 没有找到更新
    func showUpdateNotFoundWithError(_ error: any Error, acknowledgement: @escaping () -> Void) {
        LoggerManager.shared.loggerInfo("showUpdateNotFoundWithError:::: ")
        if !isCheckForUpdatesInBackground {
            ensureNotificationWindow().showNoUpdateFound(error)
        } else {
            ensureNotificationWindow().close()
        }
        acknowledgement()
    }
    
    // 更新失败
    func showUpdaterError(_ error: any Error, acknowledgement: @escaping () -> Void) {
//        LoggerManager.shared.loggerInfo("showUpdaterError:::: \(error)")
        ensureNotificationWindow().showError(error: error)
        acknowledgement()
    }
    
    func showDownloadInitiated(cancellation: @escaping () -> Void) {
//        LoggerManager.shared.loggerInfo("showDownloadInitiated:::: ")
        currentProgress = 0
        downloadSize = 0
        ensureNotificationWindow().showDownloadProgress(0)
    }
    
    func showDownloadDidReceiveExpectedContentLength(_ expectedContentLength: UInt64) {
//        LoggerManager.shared.loggerInfo("showDownloadDidReceiveData::::\(expectedContentLength) ")
        downloadSize = expectedContentLength
    }
    
    func showDownloadDidReceiveData(ofLength length: UInt64) {
//        LoggerManager.shared.loggerInfo("showDownloadDidReceiveData::::\(length) ")
       currentProgress += length
       if downloadSize > 0 {
           let progress = Double(currentProgress) / Double(downloadSize) * 100
           ensureNotificationWindow().showDownloadProgress(progress)
       }
    }
    
    func showDownloadDidStartExtractingUpdate() {
        LoggerManager.shared.loggerInfo("showDownloadDidStartExtractingUpdate:::: ")
    }
    
    func showExtractionReceivedProgress(_ progress: Double) {
        LoggerManager.shared.loggerInfo("showExtractionReceivedProgress:::: \(progress * 100)")
        ensureNotificationWindow().showDownloadProgress(progress * 100)
       
    }
    
    func showReady(toInstallAndRelaunch reply: @escaping (SPUUserUpdateChoice) -> Void) {
        if self.installType == 1 {
            ensureNotificationWindow().showReadyInstall{
                reply(.install)
            }
        } else {
            ensureNotificationWindow().showReadyInstall {
                reply(.dismiss)
            }
        }
       
        
    }
    

    
    func showInstallingUpdate(withApplicationTerminated applicationTerminated: Bool, retryTerminatingApplication: @escaping () -> Void) {
//        LoggerManager.shared.loggerInfo("showInstallingUpdate:::: ")
    }
    
    func showUpdateInstalledAndRelaunched(_ relaunched: Bool, acknowledgement: @escaping () -> Void) {
//        LoggerManager.shared.loggerInfo("showUpdateInstalledAndRelaunched:::: ")
    }
    
    func showUpdateInFocus() {
//        LoggerManager.shared.loggerInfo("showUpdateInFocus:::: ")
    }
    
    func dismissUpdateInstallation() {
//        LoggerManager.shared.loggerInfo("dismissUpdateInstallation:::: ")
    }
    

    

    
    func showCanCheck(forUpdates canCheckForUpdates: Bool) {
        // 可以在这里更新菜单项状态
    }
    

    // 找到更新
    func showUpdateFound(with appcastItem: SUAppcastItem, state: SPUUserUpdateState) async -> SPUUserUpdateChoice {
        let type = state.stage == .installing ? 1 : 0
        return await withCheckedContinuation { continuation in
            DispatchQueue.main.async {
                self.ensureNotificationWindow().showUpdateFound(type: type) { updateChoice, type in
                    self.installType = type
                    continuation.resume(returning: updateChoice)
                }
            }
            
        }
        
    }
    

}

// MARK: - 更新控制器
final class UpdateController {
    static let shared = UpdateController()
    let updater: SPUUpdater
    private let userDriver: CustomUserDriver
    
    private init() {
        // 创建自定义用户界面驱动
        userDriver = CustomUserDriver()
        
        // 创建更新器
        updater = SPUUpdater(
            hostBundle: Bundle.main,
            applicationBundle: Bundle.main,
            userDriver: userDriver,
            delegate: nil
        )
        
        // 配置更新器
        do {
            try updater.start()
            updater.automaticallyChecksForUpdates = true
            updater.automaticallyDownloadsUpdates = false
            updater.updateCheckInterval = 3600 * 6
            updater.setFeedURL(URL(string: "https:/***/appcast.xml"))
#if DEBUG
            updater.setFeedURL(URL(string: "https://******/betaappcast.xml"))
#endif

        } catch {
            print("Failed to start updater:", error)
        }
    }
    
    func checkForUpdates() {
        isCheckForUpdatesInBackground = false
        try? updater.checkForUpdates()
    }
    
    
    // 静默检查更新
    func checkForUpdatesInBackground() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
            do {
                isCheckForUpdatesInBackground = true
                try self?.updater.checkForUpdates()
                LoggerManager.shared.loggerInfo("后台检查更新已启动")
            } catch {
                LoggerManager.shared.loggerInfo("后台检查更新失败: \(error)")
            }
        }
    }
}
