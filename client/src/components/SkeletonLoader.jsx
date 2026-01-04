const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`bg-gray-200 rounded-lg animate-pulse ${className}`}>
          <div className="w-full h-48 md:h-56 bg-gray-300 rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      ))}
    </>
  )
}

export default SkeletonLoader







