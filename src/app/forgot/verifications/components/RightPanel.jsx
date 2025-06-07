"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function VerificationPanel() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(59); // Timer in seconds
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval); 
    }
  }, [timer]); 

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === "") { 
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3 && inputRefs[index + 1].current) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {   
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const verificationCode = otp.join('');
    if (verificationCode.length === 4) {
      alert(`Verification code submitted: ${verificationCode}`);
    } else {
      alert('Please enter all 4 digits of the verification code.');
    }
  };
  const handleResendCode = () => {
    if (timer === 0) {
      alert('Resending verification code...');
      setTimer(59); 
      setOtp(['', '', '', '']); 
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="right-panel bg-gray-100 p-8 md:p-10 lg:py-[50px] lg:px-[60px] w-full
     lg:w-[45%] flex flex-coljustify-center items-center min-h-[350px] lg:min-h-full">
      <div className="form-container w-full max-w-sm text-center relative left-27 ">
        <h2 className="text-3xl sm:text-[32px] text-black mb-8 font-bold  relative right-23 ">
          Verification
        </h2>
        <p className="instructions text-sm relative right-5 mb-4 leading-normal text-gray-400">
          Enter 4 digits code that you recived on your email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="  flex justify-center space-x-2 sm:space-x-3 md:space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text" 
                name={`otp-${index}`}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength="1"
                required
                className="w-12 h-12 sm:w-14 sm:h-14  md:w-16 md:h-16 text-black text-center border  rounded-md text-xl sm:text-2xl font-medium
                           focus:border-num-blue focus:outline-none focus:ring-1 focus:ring-num-blue"
              />
            ))}
          </div>

          <div className="timer text-red-600 text-sm my-4 mb-7">
            {timer > 0 ? formatTime(timer) : "Time's up!"}
          </div>

          <button
            type="submit"
            className="continue-button w-full sm:w-[90%] p-3 sm:p-[12px_15px] bg-blue-500 text-white
             border-none rounded-md text-base font-medium cursor-pointer
              transition-colors duration-300 ease-in-out hover:bg-num-button-hove"
            disabled={otp.join('').length !== 4}
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-gray-400 text-sm relative right-15">
          If you didn&apos;t receive a code.{" "}
          <button
            onClick={handleResendCode}
            disabled={timer > 0}
            className="font-medium text-red-600 hover:underline
             disabled:cursor-not-allowed"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
