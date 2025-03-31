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
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok) {
            setPending(false);
            toast.success(data.message);
            router.push("/login");
        } else if (res.status === 400) {
            setError(data.message)
            setPending(false);
        } else if (res.status === 500) {
            setError(data.message)
            setPending(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="md:h-auto w-[80%] sm:w-[420px] p-4 sm:p-8">
                <CardHeader className="text-center">
                    <CardTitle>
                        Créer un compte
                    </CardTitle>
                    <CardDescription className="text-sm text-center text-accent-foreground">
                        Créer un compte avec email ou service.
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
                            type="text"
                            disabled={pending}
                            placeholder="Nom d'utilisateur"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />

                        <Input
                            type="email"
                            disabled={pending}
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <Input
                            type="password"
                            disabled={pending}
                            placeholder="Mot de passe"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />

                        <Input
                            type="password"
                            disabled={pending}
                            placeholder="Confirmer le mot de passe"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />

                        <Button
                            className="w-full"
                            size={"lg"}
                            disabled={pending}
                            variant={"default"}
                        >
                            Créer un compte
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
                        Déjà un compte ? <Link href="/login" className="text-sky-700 ml-4 hover:underline cursor-pointer">Se connecter</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Register;