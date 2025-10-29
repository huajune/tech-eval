-- 自动同步 Supabase Auth 用户到 users 表
-- 当在 auth.users 中创建新用户时，自动在 public.users 表中创建对应记录

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, role, profile_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'candidate', -- 默认角色为候选人
    false,       -- 默认未完成个人信息
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户已存在（例如之前被手动创建），忽略错误
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 注释
COMMENT ON FUNCTION public.handle_new_user() IS '当 Supabase Auth 创建新用户时，自动在 public.users 表中创建对应记录';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS '自动同步新注册用户到 public.users 表';
