--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_announcements_audienceRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_announcements_audienceRole" AS ENUM (
    'all',
    'super_admin',
    'hr',
    'manager',
    'employee'
);


--
-- Name: enum_announcements_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_announcements_category AS ENUM (
    'hiring',
    'results',
    'event',
    'office_update',
    'holiday',
    'recognition',
    'general'
);


--
-- Name: enum_attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'half_day',
    'work_from_home',
    'on_leave',
    'holiday',
    'weekend'
);


--
-- Name: enum_documents_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_documents_type AS ENUM (
    'offer_letter',
    'id_proof',
    'resume',
    'contract',
    'payslip',
    'certificate',
    'other'
);


--
-- Name: enum_employees_employmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_employees_employmentStatus" AS ENUM (
    'active',
    'on_leave',
    'terminated',
    'resigned'
);


--
-- Name: enum_employees_employmentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_employees_employmentType" AS ENUM (
    'full_time',
    'part_time',
    'contract',
    'intern'
);


--
-- Name: enum_employees_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_employees_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_leaves_leaveType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_leaves_leaveType" AS ENUM (
    'sick_leave',
    'casual_leave',
    'earned_leave',
    'maternity_leave',
    'paternity_leave',
    'unpaid_leave'
);


--
-- Name: enum_leaves_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leaves_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


--
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'leave',
    'payroll',
    'performance',
    'announcement',
    'system'
);


--
-- Name: enum_payroll_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payroll_status AS ENUM (
    'paid',
    'pending',
    'processing'
);


--
-- Name: enum_performance_reviews_quarter; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_performance_reviews_quarter AS ENUM (
    'Q1',
    'Q2',
    'Q3',
    'Q4'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'super_admin',
    'hr',
    'manager',
    'employee'
);


--
-- Name: enum_users_themePreference; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_users_themePreference" AS ENUM (
    'light',
    'dark'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    category public.enum_announcements_category DEFAULT 'general'::public.enum_announcements_category,
    "postedById" uuid,
    "audienceRole" public."enum_announcements_audienceRole" DEFAULT 'all'::public."enum_announcements_audienceRole",
    "isPinned" boolean DEFAULT false,
    "postedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    date date NOT NULL,
    status public.enum_attendance_status NOT NULL,
    "checkIn" time without time zone,
    "checkOut" time without time zone,
    "hoursWorked" numeric(4,2) DEFAULT 0,
    "overtimeHours" numeric(4,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(10) NOT NULL,
    description text,
    "headEmployeeId" uuid,
    budget numeric(14,2),
    "colorTag" character varying(7) DEFAULT '#1F3A5F'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    type public.enum_documents_type DEFAULT 'other'::public.enum_documents_type,
    "fileUrl" character varying(255) NOT NULL,
    "uploadedById" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    "employeeCode" character varying(10) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    gender public.enum_employees_gender,
    "dateOfBirth" date,
    "departmentId" uuid,
    designation character varying(255) NOT NULL,
    "managerId" uuid,
    "employmentType" public."enum_employees_employmentType" DEFAULT 'full_time'::public."enum_employees_employmentType",
    "employmentStatus" public."enum_employees_employmentStatus" DEFAULT 'active'::public."enum_employees_employmentStatus",
    "joiningDate" date NOT NULL,
    "exitDate" date,
    "annualSalary" numeric(12,2) NOT NULL,
    "profilePicture" character varying(255),
    address jsonb,
    "emergencyContact" jsonb,
    "bankDetails" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaves (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "leaveType" public."enum_leaves_leaveType" NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "totalDays" numeric(4,1) NOT NULL,
    reason text,
    status public.enum_leaves_status DEFAULT 'pending'::public.enum_leaves_status,
    "appliedOn" timestamp with time zone NOT NULL,
    "approvedById" uuid,
    "decisionNote" text,
    "decidedOn" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type public.enum_notifications_type DEFAULT 'system'::public.enum_notifications_type,
    "isRead" boolean DEFAULT false,
    link character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: payroll; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "payslipNumber" character varying(255) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    basic numeric(12,2) NOT NULL,
    hra numeric(12,2) DEFAULT 0,
    "otherAllowances" numeric(12,2) DEFAULT 0,
    bonus numeric(12,2) DEFAULT 0,
    incentives numeric(12,2) DEFAULT 0,
    "providentFund" numeric(12,2) DEFAULT 0,
    tax numeric(12,2) DEFAULT 0,
    "otherDeductions" numeric(12,2) DEFAULT 0,
    "grossPay" numeric(12,2) NOT NULL,
    "netPay" numeric(12,2) NOT NULL,
    status public.enum_payroll_status DEFAULT 'paid'::public.enum_payroll_status,
    "paidOn" date,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: performance_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.performance_reviews (
    id uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "reviewerId" uuid,
    quarter public.enum_performance_reviews_quarter NOT NULL,
    year integer NOT NULL,
    "kpiScore" numeric(5,2) NOT NULL,
    rating integer NOT NULL,
    goals jsonb,
    strengths text,
    "areasForImprovement" text,
    "managerFeedback" text,
    "reviewDate" date NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    "employeeId" uuid,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'employee'::public.enum_users_role NOT NULL,
    "isEmailVerified" boolean DEFAULT true,
    "isActive" boolean DEFAULT true,
    "refreshToken" text,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone,
    "lastLoginAt" timestamp with time zone,
    "themePreference" public."enum_users_themePreference" DEFAULT 'light'::public."enum_users_themePreference",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_employeeCode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_employeeCode_key" UNIQUE ("employeeCode");


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payroll payroll_payslipNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT "payroll_payslipNumber_key" UNIQUE ("payslipNumber");


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews performance_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: attendance_employee_id_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attendance_employee_id_date ON public.attendance USING btree ("employeeId", date);


--
-- Name: payroll_employee_id_month_year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payroll_employee_id_month_year ON public.payroll USING btree ("employeeId", month, year);


--
-- Name: performance_reviews_employee_id_quarter_year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX performance_reviews_employee_id_quarter_year ON public.performance_reviews USING btree ("employeeId", quarter, year);


--
-- Name: attendance attendance_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leaves leaves_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payroll payroll_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT "payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


