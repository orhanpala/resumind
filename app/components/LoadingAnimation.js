export default function LoadingAnimation({ text = 'Yükleniyor...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDuration: '0.8s', animationDirection: 'reverse'}}></div>
      </div>
      <p className="text-white font-medium text-sm">{text}</p>
      <div className="flex gap-1 mt-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  )
}