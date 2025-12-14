import OnboardingWizard from "@/components/onboarding-wizard/onboarding-wizard";
import {DashboardHeader} from "@/components/dashboard-header";


const BudgetGenerator = () => {

    return (
        <>
            <DashboardHeader/>
            <div className={'md:w-[45vw] mx-auto py-10 rounded-2xl mt-5 px-4 '}>
                <OnboardingWizard/>
            </div>
        </>
    )

}

export default BudgetGenerator