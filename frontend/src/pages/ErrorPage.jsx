
import { useRouteError, Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaExclamationTriangle size={40} />
                </div>

                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-600 mb-2">
                    Oops! Something went wrong.
                </h1>

                <p className="text-gray-500 mb-6 font-medium">
                    We're sorry, but an unexpected error has occurred.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-48 border border-gray-200">
                    <p className="text-sm font-mono text-red-600">
                        {error?.statusText || error?.message || "Unknown Error"}
                    </p>
                    {error?.stack && (
                        <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                            {error.stack}
                        </pre>
                    )}
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all hover:scale-105 shadow-lg shadow-gray-200"
                >
                    <FaHome /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
