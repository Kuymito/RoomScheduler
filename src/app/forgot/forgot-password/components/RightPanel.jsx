// app/forgot-password/components/RightPanel.jsx
"use client"; // Add this if your form needs client-side JavaScript for submission

import Link from 'next/link'; // For navigation links

export default function RightPanel() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement your form submission logic here
    // For example, get form data:
    // const email = event.target.email.value;
    // console.log('Email submitted:', email);
    alert('Form submission logic needs to be implemented!');
  };

  return (
    <div className="right-panel bg-gray-100 bg-num-form-bg p-8 md:p-10 lg:p-[50px_60px] w-full lg:w-[45%] flex flex-col justify-center min-h-[350px] lg:min-h-full">
      <div className="Edit lg:relative lg:left-[40px]">
        <h2 className="text-2xl sm:text-[28px]  mb-8 font-bold">
          Forgot password
        </h2>
        <p className="instructions text-sm sm:text-[15px] text-num-light-text mb-5 leading-normal sm:leading-[1.5]">
          Enter your email for the verification process, we will send 4 <br />
          digits code to your email.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5">
            <label htmlFor="email" className="block text-sm sm:text-[16px] mb-2  font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full sm:w-[90%] p-3 sm:p-[12px_15px]  border-num-border rounded-md text-base
              bg-white  
                focus:border-num-blue focus:outline-none focus:ring-2 focus:ring-num-blue/25"
            />
          </div>
          <p className="mb-3">
            <Link href="/login" className="text-num-button-blue hover:underline "> {/* Adjust href as needed */}
             <p className=' text-blue-500 relative left-105 mb-5'> Back to login</p>
            </Link>
          </p>
          <button
            type="submit"
            className="continue-button w-full sm:w-[90%] p-3 sm:p-[12px_15px] bg-blue-500 text-white
             border-none rounded-md text-base font-medium cursor-pointer
              transition-colors duration-300 ease-in-out hover:bg-num-button-hover"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}