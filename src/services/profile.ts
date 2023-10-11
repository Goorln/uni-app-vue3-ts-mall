import type { ProfileDetail, ProfileParams } from '@/types/member'
import { http } from '@/utils/http'

export const getMemberProfileAPI = () => {
  return http<ProfileDetail>({
    method: 'GET',
    url: '/member/profile',
  })
}

// 修改个人信息接口
export const putMemberProfileAPI = (data: ProfileParams) => {
  return http({
    method: 'PUT',
    url: '/member/profile',
    data,
  })
}
