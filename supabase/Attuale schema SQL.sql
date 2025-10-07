-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  address text NOT NULL,
  staff_count integer NOT NULL CHECK (staff_count > 0),
  email character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conservation_points (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  department_id uuid NOT NULL,
  name character varying NOT NULL,
  setpoint_temp numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  product_categories ARRAY DEFAULT '{}'::text[],
  is_blast_chiller boolean DEFAULT false,
  status character varying DEFAULT 'normal'::character varying CHECK (status::text = ANY (ARRAY['normal'::character varying, 'warning'::character varying, 'critical'::character varying]::text[])),
  maintenance_due timestamp with time zone,
  CONSTRAINT conservation_points_pkey PRIMARY KEY (id),
  CONSTRAINT conservation_points_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT conservation_points_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.maintenance_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  conservation_point_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  frequency character varying NOT NULL,
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  assigned_to_staff_id uuid,
  assigned_to_role character varying,
  assigned_to_category character varying,
  title character varying,
  description text,
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying]::text[])),
  status character varying DEFAULT 'scheduled'::character varying CHECK (status::text = ANY (ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'overdue'::character varying, 'skipped'::character varying]::text[])),
  next_due timestamp with time zone,
  estimated_duration integer DEFAULT 60,
  instructions ARRAY,
  CONSTRAINT maintenance_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT maintenance_tasks_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT maintenance_tasks_staff_fkey FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id)
);
CREATE TABLE public.maintenance_tasks_backup (
  id uuid,
  company_id uuid,
  conservation_point_id uuid,
  kind USER-DEFINED,
  frequency character varying,
  assigned_to character varying,
  assignment_type USER-DEFINED,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
CREATE TABLE public.non_conformities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  severity USER-DEFINED NOT NULL,
  status USER-DEFINED DEFAULT 'open'::status_type,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT non_conformities_pkey PRIMARY KEY (id),
  CONSTRAINT non_conformities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  category_id uuid,
  department_id uuid,
  conservation_point_id uuid,
  barcode character varying,
  sku character varying,
  supplier_name character varying,
  purchase_date timestamp with time zone,
  expiry_date timestamp with time zone,
  quantity numeric,
  unit character varying,
  allergens ARRAY DEFAULT '{}'::text[],
  label_photo_url character varying,
  notes text,
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'expired'::character varying, 'consumed'::character varying, 'waste'::character varying]::text[])),
  compliance_status character varying CHECK (compliance_status::text = ANY (ARRAY['compliant'::character varying, 'warning'::character varying, 'non_compliant'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id),
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT products_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id)
);
CREATE TABLE public.shopping_list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL,
  product_id uuid,
  product_name character varying NOT NULL,
  category_name character varying NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit character varying,
  notes text,
  is_completed boolean DEFAULT false,
  added_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_list_items_pkey PRIMARY KEY (id),
  CONSTRAINT shopping_list_items_shopping_list_id_fkey FOREIGN KEY (shopping_list_id) REFERENCES public.shopping_lists(id)
);
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  created_by uuid,
  is_template boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_lists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  role character varying NOT NULL,
  category character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email character varying,
  phone character varying,
  hire_date date,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying]::text[])),
  notes text,
  haccp_certification jsonb,
  department_assignments ARRAY,
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  frequency character varying NOT NULL,
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  department_id uuid,
  conservation_point_id uuid,
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying]::text[])),
  estimated_duration integer DEFAULT 60,
  checklist ARRAY DEFAULT '{}'::text[],
  required_tools ARRAY DEFAULT '{}'::text[],
  haccp_category character varying,
  documentation_url character varying,
  validation_notes text,
  next_due timestamp with time zone,
  status character varying DEFAULT 'pending'::character varying,
  assigned_to_staff_id uuid,
  assigned_to_role character varying,
  assigned_to_category character varying,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_department_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT tasks_conservation_point_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT tasks_staff_fkey FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id),
  CONSTRAINT tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.temperature_readings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  conservation_point_id uuid NOT NULL,
  temperature numeric NOT NULL,
  recorded_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT temperature_readings_pkey PRIMARY KEY (id),
  CONSTRAINT temperature_readings_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT temperature_readings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  clerk_user_id character varying NOT NULL UNIQUE,
  company_id uuid,
  email character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  staff_id uuid,
  role character varying DEFAULT 'guest'::character varying,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT fk_user_profiles_staff FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);