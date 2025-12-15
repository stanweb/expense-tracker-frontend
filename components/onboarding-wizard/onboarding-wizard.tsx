'use client'

import React, { useState } from 'react';
import Step1Income from './step-1-income';
import Step2LivingCosts from './step-2-livingCosts';
import Step3DailyLiving from './step-3-daily-living';
import Step4Lifestyle from './step-4-lifestyle';
import Step5FinancialGoals from './step-5-financial-goals';
import Step6Debt from './step-6-debt';
import Step7Alerts from './step-7-alerts';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import aiAxiosClient from "@/utils/aiAxioClient";
import {LoadingOverlay} from "@/components/ui/loading-overlay";
import CategorySuggestions from "@/components/onboarding/CategorySuggestions";
import axios from "axios";
import axioClient from "@/utils/servicesAxiosClient";
import {useSelector} from "react-redux";
import {RootState} from "@/Interfaces/Interfaces";
import {addCategories} from "@/components/api-calls/categories";
import {Card} from "@/components/ui/card";
import {useToast} from "@/components/ui/ToastProvider";

const OnboardingWizard = () => {

    const router = useRouter()
    const userId = useSelector((state: RootState) => state.user.userId)
    const [displayMessage, setDisplayMessage] = useState('')
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        income: '',
        hasAdditionalIncome: false,
        additionalIncome: '',
        rent: '',
        utilities: '',
        transportation: '',
        groceries: '',
        diningOut: '',
        shopping: '',
        entertainment: '',
        travel: '',
        subscriptions: '',
        savings: '',
        investments: '',
        debt: '',
        extraInfo: '',
    });

    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [categories, setCategories] = useState([])
    const {showToast} = useToast()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                if (formData.hasAdditionalIncome) {
                    return formData.income !== '' && formData.additionalIncome !== '';
                }
                return formData.income !== '';
            case 2:
                return formData.rent !== '' && formData.utilities !== '' && formData.transportation !== '';
            case 3:
                return formData.groceries !== '' && formData.diningOut !== '';
            case 4:
                return formData.shopping !== '' && formData.entertainment !== '' && formData.travel !== '' && formData.subscriptions !== '';
            case 5:
                return formData.savings !== '' && formData.investments !== '';
            case 6:
                return formData.debt !== '';
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
            setError('')
        } else {
            setError('Please fill in all required fields.');
        }
    };
    const updateOnboardingComplete = async () => {
        await axioClient.put(`users/${userId}`, {onboardingCompleted: true})
    }
    const handleSkip = async () => {
       void updateOnboardingComplete()
        router.push('/')
    }

    const handleFinish = async () => {
        setDisplayMessage('Generating Categories')
        setSubmitting(true)
        try {
            const {data} =  await aiAxiosClient.post('ai/generate-category', formData)
            setCategories(data)
        }catch (e){
            console.error(e)
        } finally {
            setSubmitting(false)
        }

    }
    const handleConfirmCategories = async () => {
        setDisplayMessage("Confirming Categories")
        setSubmitting(true)
        try {
            const createCategories = await addCategories(userId, categories)
            setDisplayMessage("Generating Budgets")
            const {data} = await aiAxiosClient.post('ai/generate-budget', {
                categories: JSON.stringify(createCategories),
                userFinancialData: JSON.stringify(formData)
            })
            setDisplayMessage("Adding Budgets")
            const now = new Date();
            const newBudgets = data.map((item: any) => ({
                ...item,
                month: now.getMonth() + 1, // 1–12
                year: now.getFullYear(),
            }));
            await axioClient.post(`users/${userId}/budgets/batch`, newBudgets);

            showToast({
                title: "Success!",
                description: "Your budgets has been saved.",
                variant: "success",
                duration: 5000,
            })

            void updateOnboardingComplete()

            router.push('/')
        } catch (error: any){
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while saving your category.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className={"px-5 py-4 min-w-[35vw]"}>
            {submitting && <LoadingOverlay message={displayMessage}/>}
            {
                categories.length > 0 ? <div className={'flex justify-between items-center my-4'}>
                    <p className={"text-3xl font-bold tracking-tight text-balance"}>Review Categories</p>
                </div> : <div className={'flex justify-between items-center my-4'}>
                    <p className={"text-3xl font-bold tracking-tight text-balance"}>Let's Create A Custom Budget For You</p>
                </div>
            }

            {categories.length > 0 ? <CategorySuggestions categories={categories} /> : <Card className="px-5 py-4 rounded-3xl shadow-2xl min-w-[35vw]">
                <div className={'w-full flex justify-between items-center'}>
                    <p className={'font-bold text-sm'}>
                        Step {step} of 7
                    </p>
                    <div>
                        <p className={'text-gray-500 text-sm'}>
                            { (step/7 * 100).toFixed(0)}% Complete
                        </p>
                        <Button onClick={handleSkip} variant={'link'} className={''}>Skip</Button>.
                    </div>

                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 my-3">
                    <div
                        className="bg-gray-800 h-2 rounded-r-full transition-all duration-300"
                        style={{ width: `${(step / 7) * 100}%` }}
                    />
                </div>


                {/* Steps */}
                {step === 1 && <Step1Income formData={formData} handleInputChange={handleInputChange} />}
                {step === 2 && <Step2LivingCosts formData={formData} handleInputChange={handleInputChange} />}
                {step === 3 && <Step3DailyLiving formData={formData} handleInputChange={handleInputChange} />}
                {step === 4 && <Step4Lifestyle formData={formData} handleInputChange={handleInputChange} />}
                {step === 5 && <Step5FinancialGoals formData={formData} handleInputChange={handleInputChange} />}
                {step === 6 && <Step6Debt formData={formData} handleInputChange={handleInputChange} />}
                {step === 7 && <Step7Alerts formData={formData} handleInputChange={handleInputChange} />}

                <div>
                    {error.length > 1 && <p className={'text-xs text-red-500 my-2'}>{error}</p> }

                </div>

                {/* Navigation */}

            </Card>}


                <div className="navigation-buttons mt-4 flex justify-between">
                    {step > 1 && categories.length < 1 && <Button onClick={prevStep}>Back</Button>}
                    {step < 7 && categories.length < 1 && <Button onClick={nextStep}>Next</Button>}
                    {step === 7 && categories.length < 1 && <Button onClick={()=> handleFinish()}> Finish</Button>}
                    {categories.length > 0 && <Button onClick={()=> setCategories([])}>Back</Button>}
                    {categories.length > 0 && <Button onClick={()=> handleConfirmCategories()}>Generate Budget</Button>}

                </div>
        </div>
    );
};

export default OnboardingWizard;
