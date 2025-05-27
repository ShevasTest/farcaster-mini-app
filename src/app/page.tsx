export default function Home() {
  return (
    <div className="min-h-screen bg-purple-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">
          Farcaster Mini App
        </h1>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Welcome to your first Farcaster Mini App!
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700">
              This app will show user info when opened in Farcaster
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
