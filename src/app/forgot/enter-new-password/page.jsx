// app/create-new-password/page.jsx
import LeftPanel from './components/LeftPanel'; // Adjust path if LeftPanel is in a shared components folder
import CreateNewPasswordPanel from './components/CreateNewPasswordPanel';

export default function CreateNewPasswordPage() {
  return (
    <div className="container flex flex-col
     lg:flex-row w-full max-w-[2000px] min-h-screen lg:min-h-[729px] overflow-hidden mx-auto shadow-lg">
      <LeftPanel />
      <CreateNewPasswordPanel />
    </div>
  );
}
