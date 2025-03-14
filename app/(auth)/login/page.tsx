"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardDescription,
    CardContent,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="md:h-auto w-[80%] sm:w-[420px] p-4 sm:p-8">
                <CardHeader className="text-center">
                    <CardTitle>
                        Se connecter
                    </CardTitle>
                    <CardDescription className="text-sm text-center text-accent-foreground">
                        Se connecter avec email ou service.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <form action="" className="space-y-3">
                        <Input
                            type="email"
                            disabled={false}
                            placeholder="Email"
                            value={""}
                            onChange={() => { }}
                            required
                        />

                        <Input
                            type="password"
                            disabled={false}
                            placeholder="Mot de passe"
                            value={""}
                            onChange={() => { }}
                            required
                        />

                        <Button
                            className="w-full"
                            size={"lg"}
                            disabled={false}
                            variant={"default"}
                        >
                            Se connecter
                        </Button>
                    </form>
                    <Separator />
                    <div className="flex my-2 justify-evenly mx-auto items-center">
                        <Button
                            disabled={false}
                            onClick={() => { }}
                            variant={"outline"}
                            size={"lg"}
                            className="bg-slate-300 hover:bg-slate-400 hover:scale-100"
                        >
                            <FcGoogle className="w-6 h-6" />
                        </Button>
                        <Button
                            disabled={false}
                            onClick={() => { }}
                            variant={"outline"}
                            size={"lg"}
                            className="bg-slate-300 hover:bg-slate-400 hover:scale-100"
                        >
                            <FaGithub className="w-6 h-6" />
                        </Button>
                    </div>
                    <p className="text-center text-sm mt-2 text-muted-foreground">
                        Pas encore de compte ? <Link href="/register" className="text-sky-700 ml-4 hover:underline cursor-pointer">S'inscrire</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;
