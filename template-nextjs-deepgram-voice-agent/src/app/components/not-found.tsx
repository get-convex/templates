
import Link from "next/link"
export const NotFound = ()=>{

    return (<>
    <div className="text-center h-screen flex flex-col items-center justify-center bg-white text-gray-300 ">
        <h1 className="text-2xl font-bold mb-3">404 Not Found</h1>
        <p className="text-gray-600 mb-3">The page you are looking for does not exist.</p>
        <Link href="/home" className="text-blue-600 hover:underline">Go back to home</Link>
    </div>
    </>)
}