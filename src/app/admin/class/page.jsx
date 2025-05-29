import AdminLayout from '@/components/AdminLayout';

const ClassViewContent = () => {    
    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">
                    Class List
                </h1>
                <button type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create</button>
            </div>
            <hr className="border-t border-gray-200 mt-4 mb-6" />

            <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full rounded-lg text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3"> Action </th>
                            <th scope="col" className="px-6 py-3"> Name </th>
                            <th scope="col" className="px-6 py-3"> Generation </th>
                            <th scope="col" className="px-6 py-3"> Group </th>
                            <th scope="col" className="px-6 py-3"> Major </th>
                            <th scope="col" className="px-6 py-3"> Degrees </th>
                            <th scope="col" className="px-6 py-3"> Faculty </th>
                            <th scope="col" className="px-6 py-3"> Shift </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700">
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> </th>
                            <td className="px-6 py-4"> NUM30-01 </td>
                            <td className="px-6 py-4"> 30 </td>
                            <td className="px-6 py-4"> 01 </td>
                            <td className="px-6 py-4"> IT </td>
                            <td className="px-6 py-4"> Bachelor </td>
                            <td className="px-6 py-4"> Faculty of IT </td>
                            <td className="px-6 py-4"> 7:00 AM - 10:00 AM </td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> </th>
                            <td className="px-6 py-4">NUM30-01</td>
                            <td className="px-6 py-4">30</td>
                            <td className="px-6 py-4">01</td>
                            <td className="px-6 py-4">IT</td>
                            <td className="px-6 py-4">Bachelor</td>
                            <td className="px-6 py-4">Faculty of IT</td>
                            <td className="px-6 py-4">7:00 AM - 10:00 AM</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> </th>
                            <td className="px-6 py-4">NUM31-02</td>
                            <td className="px-6 py-4">31</td>
                            <td className="px-6 py-4">02</td>
                            <td className="px-6 py-4">CS</td>
                            <td className="px-6 py-4">Bachelor</td>
                            <td className="px-6 py-4">Faculty of Computer Science</td>
                            <td className="px-6 py-4">8:00 AM - 11:00 AM</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> </th>
                            <td className="px-6 py-4">NUM32-03</td>
                            <td className="px-6 py-4">32</td>
                            <td className="px-6 py-4">03</td>
                            <td className="px-6 py-4">IS</td>
                            <td className="px-6 py-4">Bachelor</td>
                            <td className="px-6 py-4">Faculty of Information Systems</td>
                            <td className="px-6 py-4">9:00 AM - 12:00 PM</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"></th>
                            <td className="px-6 py-4">NUM33-04</td>
                            <td className="px-6 py-4">33</td>
                            <td className="px-6 py-4">04</td>
                            <td className="px-6 py-4">SE</td>
                            <td className="px-6 py-4">Bachelor</td>
                            <td className="px-6 py-4">Faculty of Software Engineering</td>
                            <td className="px-6 py-4">1:00 PM - 4:00 PM</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> </th>
                            <td className="px-6 py-4">NUM34-05</td>
                            <td className="px-6 py-4">34</td>
                            <td className="px-6 py-4">05</td>
                            <td className="px-6 py-4">AI</td>
                            <td className="px-6 py-4">Bachelor</td>
                            <td className="px-6 py-4">Faculty of AI & Robotics</td>
                            <td className="px-6 py-4">3:00 PM - 6:00 PM</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <ClassViewContent/>
        </AdminLayout>
    );
}