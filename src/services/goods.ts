import type { GoodsItem } from '@/types/global'
import { http } from '@/utils/http'
/**
 * 商品详情
 * @param id 商品id
 */
export const getGoodsByIdAPI = (id: string) => {
  return http<GoodsItem>({
    method: 'GET',
    url: '/goods',
    data: {
      id,
    },
  })
}
