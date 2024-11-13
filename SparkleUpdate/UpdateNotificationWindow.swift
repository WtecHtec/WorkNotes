import AppKit
import Sparkle

class UpdateNotificationWindow: NSPanel {
    // MARK: - Properties
    private let stackView = NSStackView()
    private let titleLabel = NSTextField(labelWithString: "")
    private let messageLabel = NSTextField(labelWithString: "")
    private let progressBar = NSProgressIndicator()
    private var buttons: [NSButton] = []
    private var completionHandler: ((SPUUserUpdateChoice, Int) -> Void)?
    private var completionBlock: (() -> Void)?
    
    // MARK: - Initialization
    init() {
        super.init(
            contentRect: NSRect(x: 0, y: 0, width: 320, height: 240),
            styleMask: [.nonactivatingPanel, .titled, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        setupWindow()
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Setup
    private func setupWindow() {
        isFloatingPanel = true
        level = .floating
        titleVisibility = .hidden
        titlebarAppearsTransparent = true
        backgroundColor = .windowBackgroundColor
        isReleasedWhenClosed = false
        hidesOnDeactivate = false
        
        // 设置窗口圆角和阴影
        contentView?.wantsLayer = true
        contentView?.layer?.cornerRadius = 12
        contentView?.layer?.masksToBounds = true
        hasShadow = true
        
        // 居中显示
        if let mainScreen = NSScreen.main {
            let screenFrame = mainScreen.visibleFrame
            let windowFrame = self.frame
            let x = screenFrame.midX - windowFrame.width / 2
            let y = screenFrame.midY - windowFrame.height / 2
            setFrameOrigin(NSPoint(x: x, y: y))
        }
    }
    
    private func setupUI() {
        // 配置图标
        let iconImageView = NSImageView()
        if let appIcon = NSApp.applicationIconImage {
            iconImageView.image = appIcon
            iconImageView.imageScaling = .scaleProportionallyUpOrDown
            iconImageView.wantsLayer = true
            iconImageView.layer?.cornerRadius = 8
            iconImageView.layer?.masksToBounds = true
        }
        
        // 图标尺寸
        iconImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            iconImageView.widthAnchor.constraint(equalToConstant: 60),
            iconImageView.heightAnchor.constraint(equalToConstant: 60)
        ])
        
        // 标题样式
        titleLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        titleLabel.alignment = .center
        titleLabel.textColor = .labelColor
        
        // 消息样式
        messageLabel.font = .systemFont(ofSize: 13)
        messageLabel.alignment = .center
        messageLabel.textColor = .secondaryLabelColor
        messageLabel.preferredMaxLayoutWidth = 280
        messageLabel.cell?.wraps = true
        
        // 进度条样式
        progressBar.controlSize = .small
        progressBar.isIndeterminate = false
        progressBar.minValue = 0
        progressBar.maxValue = 100
        progressBar.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            progressBar.widthAnchor.constraint(equalToConstant: 280)
        ])
        
        // 堆栈视图配置
        stackView.orientation = .vertical
        stackView.spacing = 12
        stackView.edgeInsets = NSEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)
        stackView.alignment = .centerX
        
        // 添加视图
        stackView.addArrangedSubview(iconImageView)
        stackView.addArrangedSubview(titleLabel)
        stackView.addArrangedSubview(messageLabel)
        stackView.addArrangedSubview(progressBar)
        
        contentView?.addSubview(stackView)
        
        // 布局约束
        stackView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: contentView!.topAnchor),
            stackView.leadingAnchor.constraint(equalTo: contentView!.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: contentView!.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: contentView!.bottomAnchor)
        ])
    }
    
    // MARK: - Helper Methods
   
    private func createStyledButton(title: String, isPrimary: Bool = false) -> NSButton {
        let button = NSButton(title: title, target: nil, action: nil)
        
        // 移除默认样式
        button.bezelStyle = .regularSquare  // 使用基础样式
        button.isBordered = false  // 移除边框
        button.wantsLayer = true
        
        // 设置按钮尺寸
        button.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            button.widthAnchor.constraint(equalToConstant: 280),
            button.heightAnchor.constraint(equalToConstant: 32)
        ])
        
        // 设置圆角
        button.layer?.cornerRadius = 6
        button.layer?.masksToBounds = true
        
        if isPrimary {
            // 主按钮样式
            button.contentTintColor = .white
            button.layer?.backgroundColor = NSColor.controlAccentColor.cgColor
        } else {
            // 次要按钮样式
            button.contentTintColor = .black
            button.layer?.backgroundColor = NSColor.controlBackgroundColor.cgColor
        }
        
        return button
    }
    
    private func createButtonStack() -> NSStackView {
        let buttonStack = NSStackView()
        buttonStack.orientation = .vertical
        buttonStack.spacing = 8
        buttonStack.alignment = .centerX
        return buttonStack
    }
    
    private func updateWindowContent(title: String, message: String, showProgress: Bool = false) {
        titleLabel.stringValue = title
        messageLabel.stringValue = message
        progressBar.isHidden = !showProgress
        removeAllButtons()
    }
    
    private func removeAllButtons() {
        buttons.forEach { $0.removeFromSuperview() }
        buttons.removeAll()
    }
    
    // MARK: - Public Methods
    func showChecking(completion: @escaping () -> Void) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Checking for Updates",
                message: "Please wait while we check for new updates..."
            )
            self.completionBlock = completion
            
            let buttonStack = self.createButtonStack()
            let closeButton = self.createStyledButton(title: "Cancel", isPrimary: false)
            closeButton.target = self
            closeButton.action = #selector(self.closeButtonClickedToBlock)
            
            buttonStack.addArrangedSubview(closeButton)
            self.stackView.addArrangedSubview(buttonStack)
            self.buttons = [closeButton]
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    func showUpdateFound(type: Int = 0, completion: @escaping (SPUUserUpdateChoice, Int) -> Void) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Update Available",
                message: type == 0 ? "A new version is ready to be installed." : "The latest installation package is available"
            )
            self.completionHandler = completion
            
            let buttonStack = self.createButtonStack()
            
            let installButton = self.createStyledButton(title: "Install now", isPrimary: true)
            installButton.target = self
            installButton.action = #selector(self.installButtonClicked)
            
            let secondaryButton = self.createStyledButton(
                title: type == 1 ? "Close" : "Install on next launch",
                isPrimary: false
            )
            secondaryButton.target = self
            secondaryButton.action = type == 1 ? #selector(self.closeButtonClicked) : #selector(self.nextInstallButtonClicked)
            
            buttonStack.addArrangedSubview(installButton)
            buttonStack.addArrangedSubview(secondaryButton)
            
            self.stackView.addArrangedSubview(buttonStack)
            self.buttons = [installButton, secondaryButton]
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    func showDownloadProgress(_ progress: Double) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Downloading Update",
                message: String(format: "%.0f%% Complete", progress),
                showProgress: true
            )
            self.progressBar.doubleValue = progress
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    func showReadyInstall(completion: @escaping () -> Void) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Update Ready",
                message: "The update has been downloaded and is ready to install."
            )
            self.completionBlock = completion
            
            let buttonStack = self.createButtonStack()
            let restartButton = self.createStyledButton(title: "Restart Now", isPrimary: true)
            restartButton.target = self
            restartButton.action = #selector(self.closeButtonClickedToBlock)
            
            buttonStack.addArrangedSubview(restartButton)
            self.stackView.addArrangedSubview(buttonStack)
            self.buttons = [restartButton]
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    func showNoUpdateFound(_ error: Error) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Up to Date",
                message: "You're running the latest version."
            )
            
            let buttonStack = self.createButtonStack()
            let closeButton = self.createStyledButton(title: "OK", isPrimary: true)
            closeButton.target = self
            closeButton.action = #selector(self.closeButtonClicked)
            
            buttonStack.addArrangedSubview(closeButton)
            self.stackView.addArrangedSubview(buttonStack)
            self.buttons = [closeButton]
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    func showError(error: Error) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.updateWindowContent(
                title: "Update Error",
                message: "An error occurred while updating:\n\(error.localizedDescription)"
            )
            
            let buttonStack = self.createButtonStack()
            
            let retryButton = self.createStyledButton(title: "Try Again", isPrimary: true)
            retryButton.target = self
            retryButton.action = #selector(self.closeButtonClicked)
            
            let closeButton = self.createStyledButton(title: "Cancel", isPrimary: false)
            closeButton.target = self
            closeButton.action = #selector(self.closeButtonClicked)
            
            buttonStack.addArrangedSubview(retryButton)
            buttonStack.addArrangedSubview(closeButton)
            self.stackView.addArrangedSubview(buttonStack)
            self.buttons = [retryButton, closeButton]
            
            self.makeKeyAndOrderFront(nil)
        }
    }
    
    // MARK: - Button Actions
    @objc private func installButtonClicked() {
        completionHandler?(.install, 1)
    }
    
    @objc private func nextInstallButtonClicked() {
        completionHandler?(.install, 2)
    }
    
    @objc private func closeButtonClickedToBlock() {
        completionBlock?()
        close()
    }
    
    @objc private func closeButtonClicked() {
        completionHandler?(.dismiss, 2)
        close()
    }
    
    override func close() {
        super.close()
    }
}
