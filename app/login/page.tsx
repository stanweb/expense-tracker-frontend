"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/user-slice";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import axiosClient from "@/utils/servicesAxiosClient";
import {Card} from "@/components/ui/card";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axiosClient.post(
                "/auth/login",
                { username, password },
            );
            const data = response.data;

            dispatch(setUser({ userId: data.userId, username: data.username }));

            if (!data.onboardingCompleted) {
                router.push("/onboarding-wizard");
            } else {
                router.push('/');
            }

        } catch (err: any) {
            // Check if it's an Axios error with a response
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Invalid username or password.");
                } else {
                    setError(`Server returned status ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`);
                }
            } else if (err.request) {
                // Request was made but no response received
                setError("Failed to connect to the server. Please check your network.");
            } else {
                // Something else happened
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="flex min-h-screen min-w-screen items-center flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-card">
            <Card className={"rounded-3xl shadow-2xl px-4 py-2 sm:w-full md:w-[25vw]"} >
                <div className="">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <Label
                                htmlFor="username"
                                className="block text-sm font-medium leading-6 text-foreground"
                            >
                                Username
                            </Label>
                            <div className="mt-2">
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-foreground"
                                >
                                    Password
                                </Label>
                            </div>
                            <div className="mt-2">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div>
                            <Button
                                variant="default"
                                type="submit"
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-muted-foreground">
                        Not a member?{" "}
                        <a
                            href="/register"
                            className="font-semibold leading-6 text-primary hover:text-primary/80"
                        >
                            Register for free
                        </a>
                    </p>
                </div>
            </Card>

        </div>
    );
};

export default LoginPage;
