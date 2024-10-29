import SwiftUI

/// 3D Loading 动画视图
struct LoadingView: View {
    // MARK: - Properties
    @State private var rotationDegree: Double = 0
    private let configuration: LoadingConfiguration
    
    // MARK: - Initialization
    init(configuration: LoadingConfiguration = .default) {
        self.configuration = configuration
    }
    
    // MARK: - Body
    var body: some View {
        ZStack {
            ForEach(0..<configuration.dotCount, id: \.self) { index in
                DotView(configuration: configuration)
                    .modifier(CircularMotionModifier(
                        index: index,
                        configuration: configuration,
                        rotationDegree: rotationDegree
                    ))
            }
        }
        .frame(width: configuration.radius * 2, height: configuration.radius * 2)
        .onAppear {
            withAnimation(
                .linear(duration: configuration.duration)
                .repeatForever(autoreverses: false)
            ) {
                rotationDegree = -360
            }
        }
    }
}

/// 单个圆点视图
struct DotView: View {
    let configuration: LoadingConfiguration
    
    var body: some View {
        Circle()
            .fill(configuration.dotColor)
            .frame(width: configuration.dotSize, height: configuration.dotSize)
    }
}

/// Loading动画配置
struct LoadingConfiguration {
    let dotCount: Int
    let dotSize: CGFloat
    let radius: CGFloat
    let dotColor: Color
    let duration: Double
    let minScale: CGFloat
    let maxScale: CGFloat
    let minOpacity: Double
    let maxOpacity: Double
    let perspectiveAngle: CGFloat
    let maxDeformationRatio: CGFloat  // 最大变形比例
    
    static let `default` = LoadingConfiguration(
        dotCount: 12,
        dotSize: 12,
        radius: 50,
        dotColor: .blue,
        duration: 2.0,
        minScale: 0.3,
        maxScale: 1.0,
        minOpacity: 0.3,
        maxOpacity: 1.0,
        perspectiveAngle: .pi / 18,
        maxDeformationRatio: 0.6      // 最大压缩到原始宽度的60%
    )
}

/// 3D圆周运动修饰器
struct CircularMotionModifier: AnimatableModifier {
    let index: Int
    let configuration: LoadingConfiguration
    var rotationDegree: Double
    
    var animatableData: Double {
        get { rotationDegree }
        set { rotationDegree = newValue }
    }
    
    func body(content: Content) -> some View {
        let startAngle: CGFloat = -.pi / 2
        let angle = startAngle + 2 * .pi * (CGFloat(index) / CGFloat(configuration.dotCount)) + (.pi * rotationDegree / 180)
        
        let x = configuration.radius * cos(angle)
        let z = configuration.radius * sin(angle)
        
        let yOffset = z * sin(configuration.perspectiveAngle)
        let perspectiveScale = calculatePerspectiveScale(z)
        let finalScale = mapZToScale(z) * perspectiveScale
        
        // 计算变形程度
        let deformation = calculateDeformation(angle)
        
        return content
            .scaleEffect(
                x: finalScale * deformation.width,
                y: finalScale * deformation.height,
                anchor: .center
            )
            .opacity(mapZToOpacity(z))
            .position(
                x: x + configuration.radius,
                y: configuration.radius + yOffset
            )
            .zIndex(-z)
    }
    
    // MARK: - Helper Methods
    /// 计算变形比例
    private func calculateDeformation(_ angle: CGFloat) -> (width: CGFloat, height: CGFloat) {
        // 将角度归一化到 -π 到 π 的范围
        let normalizedAngle = abs(angle.truncatingRemainder(dividingBy: .pi))
        
        // 计算变形程度（在正面时无变形，在侧面时最大变形）
        let deformationRatio = abs(sin(normalizedAngle))
        
        // 计算宽度压缩
        let widthScale = 1.0 - (deformationRatio * (1.0 - configuration.maxDeformationRatio))
        
        // 保持面积近似不变
        let heightScale = 1.0 / widthScale
        
        return (width: widthScale, height: heightScale)
    }
    
    private func calculatePerspectiveScale(_ z: CGFloat) -> CGFloat {
        let distance: CGFloat = 1000
        return distance / (distance - z * sin(configuration.perspectiveAngle))
    }
    
    private func mapZToScale(_ z: CGFloat) -> CGFloat {
        let normalizedZ = (z + configuration.radius) / (2 * configuration.radius)
        return configuration.minScale + (configuration.maxScale - configuration.minScale) * normalizedZ
    }
    
    private func mapZToOpacity(_ z: CGFloat) -> Double {
        let normalizedZ = (z + configuration.radius) / (2 * configuration.radius)
        return configuration.minOpacity + (configuration.maxOpacity - configuration.minOpacity) * normalizedZ
    }
}

// MARK: - Preview
struct LoadingView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 50) {
                LoadingView()
                
                LoadingView(configuration: .init(
                    dotCount: 12,
                    dotSize: 8,
                    radius: 20,
                    dotColor: .white,
                    duration: 3.0,
                    minScale: 1.2,
                    maxScale: 1.2,
                    minOpacity: 0.2,
                    maxOpacity: 1.0,
                    perspectiveAngle: .pi / 30,
                    maxDeformationRatio: 0.8
                ))
            }
        }
    }
}
