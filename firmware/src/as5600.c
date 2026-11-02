#include "as5600.h"
bool as5600_sample(as5600_read_fn read, void *context, as5600_sample_t *s) {
  uint8_t bytes[3]={0};
  *s=(as5600_sample_t){0};
  if(!read || !read(context,0x0b,bytes,3)) return false;
  s->status=bytes[0];
  if((bytes[0]&0x38u)!=0x20u || (bytes[1]&0xf0u)) return false;
  s->angle=((uint16_t)bytes[1]<<8)|bytes[2]; s->valid=true; return true;
}
