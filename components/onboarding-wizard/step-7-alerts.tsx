'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "./types";
import {Textarea} from "@/components/ui/textarea";

const Step7Alerts = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="p-4">
            <div>
                <p className="text-xl font-semibold my-3">
                    Any extra information to your spending habits?
                </p>
            </div>

            <Textarea
                value={formData.extraInfo}
                rows={10}
                placeholder={'i.e Family & Friend = 500'}
                onChange={handleInputChange}
                id="extra-info"
                name="extraInfo"
            />
        </div>
    );
};

export default Step7Alerts;
