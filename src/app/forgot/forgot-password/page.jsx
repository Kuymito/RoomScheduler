import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';

export default function ForgotPasswordPage() {
  return (
   <div className="container flex flex-col
     lg:flex-row w-full max-w-[2000px] min-h-screen lg:min-h-[729px] overflow-hidden mx-auto shadow-lg">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}