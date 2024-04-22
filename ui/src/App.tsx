import UploadForm from './components/UploadForm';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full max-w-[550px] bg-white">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
