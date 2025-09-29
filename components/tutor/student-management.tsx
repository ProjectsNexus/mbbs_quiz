"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTutor } from "@/hooks/use-tutor"
import { Plus, Search, Filter, Edit, Trash2, Users, TrendingUp, Clock, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { Progress } from "../ui/progress"

export function StudentManagement() {
  const { students, addStudent, removeStudent, updateStudent, getStudentsByBatch } = useTutor()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [bulkJsonFile, setBulkJsonFile] = useState<File | null>(null)
  const [bulkJsonText, setBulkJsonText] = useState("") // For textarea
  const [loading, setLoading] = useState(false)

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    batch: "",
    year: "",
  })

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"]
  const batches = years

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch
    return matchesSearch && matchesBatch
  })

  const handleAddStudent = async () => {
    setLoading(true)
    if (newStudent.name && newStudent.email && newStudent.batch) {
      await addStudent({
        ...newStudent,
        joinedAt: new Date(),
        performance: {
          totalQuizzes: 0,
          averageScore: 0,
          lastActive: new Date(),
        },
      })
      setNewStudent({ name: "", email: "", batch: "", year: "" })
      setLoading(false)
      setIsAddDialogOpen(false)
    }
  }

  
  // New function to handle bulk student creation
  const handleBulkAdd = async () => {
    setLoading(true)
    if (!bulkJsonText) return alert("Please provide JSON data")

    try {
      const studentsData = JSON.parse(bulkJsonText) as { id?: string; email: string; year: string }[]
      const newStudents = studentsData.map((s) => ({
        name: s.email.split("@")[0],
        email: s.email,
        batch: s.year,
        year: s.year,
        joinedAt: new Date(),
        performance: {
          totalQuizzes: 0,
          averageScore: 0,
          lastActive: new Date(),
        },
      }))

      for (const student of newStudents) {
        await addStudent(student)
      }
      setLoading(false)
      setBulkJsonText("")
      setBulkJsonFile(null)
      setIsAddDialogOpen(false)
      alert(`${newStudents.length} students added successfully!`)
    } catch (error) {
      console.error("Invalid JSON data", error)
      alert("Invalid JSON format. Please check your input.")
    }
  }

  const getBatchStats = (batch: string) => {
    const batchStudents = getStudentsByBatch(batch)
    return {
      count: batchStudents.length,
      avgScore:
        batchStudents.length > 0
          ? Math.round(batchStudents.reduce((sum, s) => sum + s.performance.averageScore, 0) / batchStudents.length)
          : 0,
    }
  }
  
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Management</h2>
            <p className="text-muted-foreground">Manage your students and organize them into batches</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Add a new student to your class</DialogDescription>
              </DialogHeader>

                <Tabs defaultValue="add" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="single">Create Single Student</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Student Add</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            placeholder="Enter student's full name"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            placeholder="Enter student's email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="year">Academic Year</Label>
                          <Select
                            value={newStudent.year}
                            onValueChange={(value) => setNewStudent({ ...newStudent, year: value, batch: value })}
                          >
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
                        <Button onClick={handleAddStudent} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Add Student...
                            </>
                          ) : (
                            "Add Student"
                          )}
                        </Button>
                      </div>    
                  </TabsContent>

                  <TabsContent value="bulk">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="jsonFile">JSON File</Label>
                          <Input
                            id="jsonFile"
                            type="file"
                            accept=".json"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0]
                                setBulkJsonFile(file)
                                try {
                                  const text = await file.text()
                                  setBulkJsonText(text) // Show JSON in textarea
                                } catch (error) {
                                  console.error("Failed to read file", error)
                                  alert("Failed to read JSON file")
                                }
                              }
                            }}
                          />
                        </div>
                          <div className="space-y-3">
                            <Label htmlFor="bulkJson">Bulk JSON</Label>
                            <Textarea
                              id="bulkJson"
                              placeholder='Paste JSON array here: [{"email":"john@example.com","year":"1st Year"}]'
                              value={bulkJsonText}
                              onChange={(e) => setBulkJsonText(e.target.value)}
                              rows={8}
                              className="overflow-y-auto resize-none max-h-16"
                              
                            />
                          </div>
                        <div>
                          <Label htmlFor="year">Academic Year</Label>
                          <Select
                            value={newStudent.year}
                            onValueChange={(value) => setNewStudent({ ...newStudent, year: value, batch: value })}
                          >
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
                        <Button onClick={handleBulkAdd} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding Students...
                            </>
                          ) : (
                            "Add Students from JSON"
                          )}
                        </Button>
                      </div>
                  </TabsContent>

                </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Batch Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {batches.map((batch) => {
            const stats = getBatchStats(batch)
            return (
              <Card key={batch}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{batch}</p>
                      <p className="text-2xl font-bold">{stats.count}</p>
                      <p className="text-xs text-muted-foreground">Avg: {stats.avgScore}%</p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
            <CardDescription>View and manage all your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  {/* <TableHead>Year</TableHead> */}
                  <TableHead>Performance</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.batch}</Badge>
                    </TableCell>
                    {/* <TableCell>{student.year}</TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{student.performance.averageScore}%</span>
                        <span className="text-sm text-muted-foreground">
                          ({student.performance.totalQuizzes} quizzes)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {student.performance.lastActive && "seconds" in student.performance.lastActive
                            ? new Date(student.performance.lastActive.seconds * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                          </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStudent(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}
