
import { ChangeEvent } from "react";

export interface WizardStepProps {
    formData: {
        income: string;
        hasAdditionalIncome: boolean;
        additionalIncome: string;
        rent: string;
        utilities: string;
        transportation: string;
        groceries: string;
        diningOut: string;
        shopping: string;
        entertainment: string;
        travel: string;
        subscriptions: string;
        savings: string;
        investments: string;
        debt: string;
        extraInfo: string;
    };
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
