import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Assuming you have a Header or will create one, if not I can inline a simple header or skip

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Sidebar />
            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* <Header />  If you happen to have a header, put it here. For now, dashboards might have their own headers or we can create a common one */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
