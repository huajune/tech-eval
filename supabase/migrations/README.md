# Supabase 数据库迁移

## 自动同步用户触发器

### 问题
当用户在 Supabase Auth 注册后，`auth.users` 表会自动创建记录，但我们的 `public.users` 表不会自动同步，导致应用无法正确识别用户角色。

### 解决方案
使用数据库触发器自动同步新注册用户。

### 安装触发器

1. 在 Supabase Dashboard 打开 SQL Editor
2. 执行 `create_user_trigger.sql` 文件中的SQL
3. 完成！以后所有新注册用户都会自动同步

### 回填现有用户

如果您已经有一些用户在 `auth.users` 中但不在 `public.users` 中，执行以下SQL回填：

```sql
-- 回填现有的 auth 用户到 public.users 表
INSERT INTO public.users (auth_user_id, email, role, profile_completed, created_at, updated_at)
SELECT
  au.id,
  au.email,
  'candidate' as role,
  false as profile_completed,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.auth_user_id
WHERE u.id IS NULL;  -- 只插入不存在的用户
```

### 验证

检查触发器是否正常工作：

```sql
-- 查看触发器
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 测试：注册一个新用户后，检查是否自动创建
SELECT
  au.email as auth_email,
  u.email as users_email,
  u.role,
  u.profile_completed
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.auth_user_id
ORDER BY au.created_at DESC
LIMIT 5;
```

### 卸载触发器

如果需要移除触发器：

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

## 注意事项

- 触发器使用 `SECURITY DEFINER`，以确保有权限插入 `public.users` 表
- 如果用户记录已存在（例如手动创建），触发器会忽略 `unique_violation` 错误
- 默认创建的用户角色为 `candidate`，管理员需要手动修改
