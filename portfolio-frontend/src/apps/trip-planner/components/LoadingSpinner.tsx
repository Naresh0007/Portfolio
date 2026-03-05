export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#002664] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium animate-pulse">Calculating your best route...</p>
        </div>
    );
}
