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
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

const Login = () => {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [pending, setPending] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPending(true);
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        })
        if (res?.ok) {
            router.push("/");
            toast.success("Connexion effectuée")
        } else if (res?.status === 401) {
            setError("Invalid Credentials");
            setPending(false)
        } else {
            setError("Quelque chose s'est mal passé...");
        }
    }

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
                {!!error && (
                    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                        <TriangleAlert />
                        <p>{error}</p>
                    </div>
                )}
                <CardContent className="px-2 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            type="email"
                            disabled={pending}
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            disabled={pending}
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            className="w-full cursor-pointer"
                            size={"lg"}
                            disabled={pending}
                            variant={"default"}
                        >
                            Se connecter
                        </Button>
                    </form>
                    <Separator />
                    {/* <div className="flex my-2 justify-evenly mx-auto items-center">
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
                    </div> */}
                    <p className="text-center text-sm mt-2 text-muted-foreground">
                        Pas encore de compte ? <Link href="/register" className="text-sky-700 ml-4 hover:underline cursor-pointer">S'inscrire</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;
