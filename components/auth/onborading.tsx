"use client"

import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"
import { Plus } from "lucide-react"
import { Label } from "recharts"
import { Button } from "../ui/button"
import { DialogHeader } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { useState } from "react"


export default function Onborading () {
    const completeStudentSignup = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const email = window.localStorage.getItem("studentEmail") || prompt("Enter your email")
        const result = await signInWithEmailLink(auth, email!, window.location.href)
        const uid = result.user.uid
    
    
        // Update student doc with UID and mark as active
        await updateDoc(doc(db, "students", email!), {
          userID: uid,
          pending: false,
        })
    
        console.log("Student signup completed:", email)
      }
    }
    const [newStudent, setNewStudent] = useState({
      name: "",
      email: "",
      batch: "",
      year: "1st Year",
    })
  
    const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"]

  return (
    <div className=" space-y-5">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Onboarding</h2>
            <p className="text-sm text-muted-foreground">Complete your profile to get started</p>
        </div>
        <div className="p-4 rounded-lg shadow-sm">
            <div className="w-full">
                <div className="grid w-full grid-cols-2">
                    <h3 >I'm a Student</h3>
                </div>
                <div className="mt-4">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Enter your full name" />
                        </div> 
                        <div className="space-y-3">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="Enter your email" />
                        </div>
                        <div>
                            <Label>Academic Year</Label> 
                            <Select onValueChange={(value) => setNewStudent({ ...newStudent, year: value, batch: value })} className="text-sm text-white">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (  
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={completeStudentSignup} className="w-full">Complete Signup</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )

}

