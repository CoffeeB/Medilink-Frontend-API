import React from 'react'
import Image from 'next/image'
import { Search, AlarmClock, Mail, Bell, PlusCircle, UserCircle, ChevronDown, LogOut, AtSign, User, UserCog } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser, logout } from '@/hooks/auth'

  const links = [
    { name: 'Authorizations', href: '/admin/more/authorization' },
    { name: 'Client Compliance', href: '/admin/more/compliance' },
    { name: 'Clinic Files', href: '/admin/more/clinic-files' },
    { name: 'Default Goals', href: '/admin/more/goals' },
    { name: 'Document Templates', href: '/admin/more/templates' },
    { name: 'Portal Parental Access (CP)', href: '/admin/more/parental-access' },
    { name: 'Roles', href: '/admin/more/roles' },
    { name: 'Services', href: '/admin/more/services' },
    { name: 'Settings', href: '/admin/more/settings' },
    { name: 'Sites', href: '/admin/more/sites' },
    { name: 'Staff Documents', href: '/admin/more/staff-document' },
  ];

  const linksAudit = [
    { name: 'Staff Audit', href: '/admin/more/staff-audit' },
    { name: 'Client Audit', href: '/admin/more/client-audit' },
  ];

  const linksMisc = [
    { name: 'Task Manager', href: '/admin/more/tasks' },
    { name: 'Admin. Board', href: '/admin/more/admin-board' },
    { name: 'Time Clock', href: '/admin/more/time-clock' },
    { name: 'Knowledge Base', href: '/admin/more/knowledge-base' },
  ];

const LogoutMenuItem = () => {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="text-red-600 focus:text-red-600 cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  );
};

const AdminHeader = () => {
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    const currentPath = pathname?.split('/')[2];
    return currentPath === path ? 'bg-primary text-white' : '';
  }

  const isActiveFullPath = (path: string) => {
    const currentPath = pathname;
    return currentPath === path ? 'bg-primary text-white' : '';
  }

  return (
    <header className="bg-white border-b">
      <div className='border-b'>
        <div className='mx-auto max-w-[1350px]'>
          <div className="flex items-center justify-between h-[80px] px-6 py-3">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/logo.png"
                alt="Next.js logo"
                width={150}
                height={32}
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative mr-10 hidden md:block">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
                <Input className='mt-0 pl-10' placeholder="Find Clients..." />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='text-primary hover:text-primary' asChild variant="ghost" size="icon">
                    <Bell className="h-6 w-6 cursor-pointer" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-52'>
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    No new notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className='text-primary hover:text-primary' asChild variant="ghost" size="icon">
                <AlarmClock className="h-6 w-6 cursor-pointer" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <PlusCircle fill='#021F55' color='white' className="h-6 w-6 cursor-pointer" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Mail className="h-6 w-6 cursor-pointer" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6 cursor-pointer" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {getStoredUser()?.username}
                    </div>
                    <div className="text-muted-foreground flex items-center">
                      <AtSign className="mr-2 h-4 w-4" />
                      {getStoredUser()?.email}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground flex items-center">
                      <UserCog className="mr-2 h-4 w-4" />
                      Role: {getStoredUser()?.role}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <LogoutMenuItem />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-[1350px]'>
        <div className='flex items-center justify-between px-6 py-3'>
          <div className="flex flex-wrap flex-row items-center gap-4">
            <Link href="/admin/dashboard">
              <Button className={`${isActivePath('dashboard')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/staff">
              <Button className={`${isActivePath('staff')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Staff
              </Button>
            </Link>
            <Link href="/admin/clients">
              <Button className={`${isActivePath('clients')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Clients
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button className={`${isActivePath('messages')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Messages
              </Button>
            </Link>
            <Link href="/admin/calendar">
              <Button className={`${isActivePath('calendar')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Calendar
              </Button>
            </Link>
            <Link href="/admin/documents">
              <Button className={`${isActivePath('documents')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                Documents
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={`${isActivePath('billing')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                  Billing <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-52'>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link className={`${isActiveFullPath('/admin/billing/new')}`} href="/admin/billing/new">New Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link className={`${isActiveFullPath("/admin/billing/submissions")}`} href="/admin/billing/submissions">Billing Submissions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link className={`${isActiveFullPath("/admin/billing/remittance")}`} href="/admin/billing/remittance">Billing Remittance</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link className={`${isActiveFullPath("/admin/billing/profiles")}`} href="/admin/billing/profiles">Billing Profiles</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={`${isActivePath('more')} font-semibold rounded-sm text-[14px] h-7 w-22`} variant="pill" size="sm">
                  More <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-auto'>
                <div className='flex flex-row p-5 gap-4'>
                  <div className='flex flex-col'>
                    <p className='font-bold bg-blue-100 px-3 py-[0.2px] mb-2 rounded-md text-lg'>Clinic</p>
                    <ul className="ml-2 space-y-1 text-sm">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`${pathname === link.href ? 'text-blue-600' : 'text-black'} hover:font-semibold`}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                  </div>
                  <div className='flex flex-col'>
                    <p className='font-bold bg-blue-100 px-3 py-[0.2px] mb-2 rounded-md text-lg'>Audit</p>
                    {/* <ul className='ml-2 space-y-1 text-sm'>
                      <li>Staff Audit</li>
                      <li>Client Audit</li>
                    </ul> */}

                    <ul className="ml-2 space-y-1 text-sm">
                      {linksAudit.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`${pathname === link.href ? 'text-blue-600' : 'text-black'} hover:font-semibold`}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <p className='font-bold bg-blue-100 px-3 py-[0.2px] mb-2 rounded-md text-lg mt-5'>Misc.</p>
                    {/* <ul className='ml-2 space-y-1 text-sm'>
                      <li>Task Manager</li>
                      <li>Admin. Board</li>
                      <li>Time Clock</li>
                      <li>Knowledge Base</li>
                    </ul> */}

                    <ul className="ml-2 space-y-1 text-sm">
                      {linksMisc.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`${pathname === link.href ? 'text-blue-600' : 'text-black'} hover:font-semibold`}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                  </div>

                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
