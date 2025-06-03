// app/forgot-password/page.jsx
import CreateNewPasswordPanel from './components/CreateNewPasswordPanel';
import LeftPanel from './components/LeftPanel';


export default function ForgotPasswordPage() {
  return (
    <div className="container bg-blue-400 flex flex-col lg:flex-row w-full
     max-w-[2000px] min-h-auto lg:min-h-[729px] overflow-hidden mx-auto my-5 lg:my-0 shadow-lg">
      <LeftPanel />
      <CreateNewPasswordPanel/>
    </div>
  );
}