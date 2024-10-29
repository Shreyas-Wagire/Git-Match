"use client"

import React, { useState, useEffect } from 'react'
import { Moon, Sun, Search, MapPin, Link, Twitter, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
// import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type User = {
  name: string
  login: string
  avatar_url: string
  created_at: string
  bio: string
  public_repos: number
  followers: number
  following: number
  location: string
  blog: string
  twitter_username: string
  company: string
}

type Repo = {
  id: number
  name: string
  html_url: string
  description: string
  language: string
}

export default function Component() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [username, setUsername] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [languageStats, setLanguageStats] = useState<{ name: string; value: number }[]>([])
  // const { toast } = useToast()

  useEffect(() => {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null

    if (storedTheme === 'dark' || (!storedTheme && prefersDarkScheme.matches)) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const fetchUser = async (username: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.github.com/users/${username}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      const data = await response.json()
      setUser(data)
      await fetchRepos(username)
    } catch (err) {
      // toast({
        // title: "Error",
        // description: err instanceof Error ? err.message : 'An error occurred',
        // variant: "destructive",
      // })
    } finally {
      setLoading(false)
    }
  }

  const fetchRepos = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`)
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepos(data)
      calculateLanguageStats(data)
    } catch (err) {
      // toast({
        // title: "Error",
        // description: err instanceof Error ? err.message : 'An error occurred',
        // variant: "destructive",
      // })
    }
  }

  const calculateLanguageStats = (repos: Repo[]) => {
    const stats: Record<string, number> = {}
    repos.forEach(repo => {
      if (repo.language) {
        stats[repo.language] = (stats[repo.language] || 0) + 1
      }
    })
    const chartData = Object.entries(stats).map(([name, value]) => ({ name, value }))
    setLanguageStats(chartData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      fetchUser(username.trim())
    } else {
      // toast({
        // title: "Error",
        // description: "Please enter a username",
        // variant: "destructive",
      // })
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold ">GitMatch</h1>
          <Button variant="ghost" onClick={switchTheme} className="flex items-center space-x-2 text-sm font-bold uppercase">
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </header>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-primary" />
              <Input
                type="text"
                placeholder="Search GitHub username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : user && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full" />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{user.name || user.login}</h2>
                      <a href={`https://github.com/${user.login}`} className="text-primary">@{user.login}</a>
                    </div>
                    <p className="text-sm">Joined {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <p className="mt-4">{user.bio || 'This profile has no bio'}</p>
                  <div className="mt-6 p-4 rounded-lg grid grid-cols-3 gap-4 text-center bg-secondary">
                    <div>
                      <h3 className="text-sm">Repos</h3>
                      <p className="font-bold">{user.public_repos}</p>
                    </div>
                    <div>
                      <h3 className="text-sm">Followers</h3>
                      <p className="font-bold">{user.followers}</p>
                    </div>
                    <div>
                      <h3 className="text-sm">Following</h3>
                      <p className="font-bold">{user.following}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>{user.location || 'Not Available'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link className="w-5 h-5" />
                      <a href={user.blog} target="_blank" rel="noopener noreferrer" className="truncate">
                        {user.blog || 'Not Available'}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter className="w-5 h-5" />
                      <span>{user.twitter_username || 'Not Available'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>{user.company || 'Not Available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {user && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Recent Repositories</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {repos.map(repo => (
                    <li key={repo.id} className="p-2 bg-secondary rounded">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                        {repo.name}
                      </a>
                      <p className="text-sm">{repo.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Language Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}