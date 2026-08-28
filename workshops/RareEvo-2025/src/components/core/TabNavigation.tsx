



export const TabNavigation = ({
    activeTab,
    setActiveTab,
    flowsCount
}: {
    activeTab: 'existing' | 'create';
    setActiveTab: (tab: 'existing' | 'create') => void;
    flowsCount: number;
}) => (
    <div className="border-b border-slate-200">
        <nav className="flex space-x-4 md:space-x-6 lg:space-x-8">
            <button
                onClick={() => setActiveTab('existing')}
                className={`py-2 md:py-3 lg:py-4 border-b-2 font-medium text-xs md:text-sm lg:text-base transition-colors ${activeTab === 'existing'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
            >
                Credential Offers ({flowsCount})
            </button>
            <button
                onClick={() => setActiveTab('create')}
                className={`py-2 md:py-3 lg:py-4 border-b-2 font-medium text-xs md:text-sm lg:text-base transition-colors ${activeTab === 'create'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
            >
                New
            </button>
        </nav>
    </div>
);
