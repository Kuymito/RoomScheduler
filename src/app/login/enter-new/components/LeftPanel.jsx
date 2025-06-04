export default function LeftPanel() {
  return (
    <div className="left-panel  bg-blue-500 bg-num-blue text-white p-8 md:p-10 lg:p-[50px_40px] w-full
     lg:w-[55%] flex flex-col items-center text-center min-h-[300px] lg:min-h-full">
      <div className="logo w-[115px] h-[115px] rounded-full  mb-7 mt-5 flex items-center justify-center text-xs  font-bold ">
        <span className="logo-placeholder-text p-3.4">
          <img
            src="https://numregister.com/assets/img/logo/num.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </span>
      </div>
      <h1 className="university-name-km font-serif text-2xl sm:text-[30px] font-bold mb-4">
        សាកលវិទ្យាល័យជាតិគ្រប់គ្រង
      </h1>
      <h2 className="university-name-en font-roboto text-base sm:text-[25px] font-medium leading-[0.1] mb-15">
        Nation University of Management
      </h2>
      <div className="edit_text lg:relative lg:left-[60px] w-full max-w-full md:max-w-[450px] lg:max-w-none">
        <h3 className="welcome-title text-lg text-white sm:text-[28px] font-medium mb-3 text-left w-full relative right-6">
          Welcome student login form.
        </h3>
        <p className="welcome-text  sm:text-[17px] leading-relaxed sm:leading-[1.9] text-left relative right-6">
          First, as the Rector of the National University of Management (NUM),
          I would like to <br /> sincerely &gt; welcome you to our institution here in the  Capital City of Phnom Penh, <br />
          Cambodia. For those who have become our  partners and friends, I extent a heartfelt <br />
          appreciation for your cooperation and support in advancing higher education  in our <br />
          developing nation. The  development of NUM as a quality education  institution began <br />
          at its  commencement in 1983. NUM continues to be one of the leading  
          universities <br /> in Cambodia.
        </p>
      </div>
    </div>
  );
}