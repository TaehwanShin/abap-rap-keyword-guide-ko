---
title: 예제 - CL_ABAP_BEHV_AUX 로 RAP 호출 상황 알아내기
summary: 같은 RAP BO 를 직접, interface 로, interface extension 의 action 으로, projection 으로 불러 보고 그때마다 GET_CURRENT_CONTEXT 가 돌려주는 값이 어떻게 달라지는지 보는 예제입니다.
keywords: CL_ABAP_BEHV_AUX, GET_CURRENT_CONTEXT, GET_CURRENT_HANDLER_KIND, from_interface, from_projection, in_local_mode, RAP BO interface, 인터페이스, projection, 프로젝션, BDEF extension, 확장, extensible, 호출 상황, 예제
---

## 설명

[[abaprap_cl_abap_behv_aux|CL_ABAP_BEHV_AUX]] 의 메서드가 호출 경로에 따라 무엇을 돌려주는지 보여 주는 예제입니다. 같은 기반 RAP BO 를 네 가지 길로 부릅니다.

등장하는 것은 다음과 같습니다.

| 구성 | 내용 |
| --- | --- |
| 기반 RAP BO | root entity(루트 엔터티) 하나짜리 managed RAP BO 입니다. behavior definition(동작 정의)에 `extensible` 이 붙어 있습니다. handler method(핸들러 메서드)에는 업무 로직이 없고, 메서드마다 `get_current_context` 와 `get_current_handler_kind` 를 불러 결과를 behavior pool(동작 풀) 전역 클래스의 내부 테이블에 쌓습니다. |
| RAP BO interface | 기반 RAP BO 를 그대로 내보이는 interface behavior definition 입니다. |
| RAP BO interface extension(확장) | interface 를 거쳐 base BO(기반 BO) 를 확장하는 BDEF extension 입니다. 루트를 interface 이름으로 가리키고 extension action 하나를 더합니다. action 은 extension behavior pool 에 구현되어 있고 특정 필드를 기본값으로 고칩니다. extension behavior pool 의 메서드도 같은 방식으로 호출 상황을 기록합니다. |
| RAP projection BO | base BO 의 CDS 뷰를 바탕으로 한 projection 입니다. 필드 가운데 일부만 내보입니다. |

실행 클래스는 EML 로 네 단계를 밟습니다. 단계마다 저장한 뒤 DB 테이블 내용과 호출 상황 기록을 출력하고 기록을 비웁니다.

1. root entity 에 직접 생성
2. RAP BO interface 를 거쳐 생성
3. interface extension 이 더한 action 실행
4. projection 을 거쳐 생성

## 예제

handler method 마다 넣는 기록 코드입니다. `gt_context_log` 는 behavior pool 전역 클래스 `zbp_r_travel` 에 선언해 둔 `string_table` 타입의 정적 속성입니다.

```abap
METHOD validatedates.
  cl_abap_behv_aux=>get_current_context(
    IMPORTING
      from_projection = DATA(lv_projection)
      from_interface  = DATA(lv_interface)
      in_local_mode   = DATA(lv_local_mode) ).

  " 원문에는 이 메서드의 호출 꼴이 나오지 않는다. 매개변수는 클래스 정의에서 확인할 것
  DATA(lv_kind) = cl_abap_behv_aux=>get_current_handler_kind( ).

  " 어느 메서드가 어떤 상황에서 불렸는지 한 줄로 남긴다
  APPEND |validateDates: kind={ lv_kind } projection={ lv_projection } | &&
         |interface={ lv_interface } local={ lv_local_mode }|
    TO zbp_r_travel=>gt_context_log.
ENDMETHOD.
```

RAP BO consumer(사용자) 쪽에서는 같은 BO 를 길을 바꿔 가며 부릅니다.

```abap
" 1) base BO 에 직접
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID Status )
    WITH VALUE #( ( %cid = 'cid1' TravelID = '00000001' AgencyID = '070001' Status = 'N' ) )
  MAPPED DATA(ls_mapped) FAILED DATA(ls_failed) REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" 2) RAP BO interface 를 거쳐 → from_interface 가 채워진다
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID Status )
    WITH VALUE #( ( %cid = 'cid2' TravelID = '00000002' AgencyID = '070001' Status = 'N' ) )
  MAPPED DATA(ls_mapped_i) FAILED DATA(ls_failed_i) REPORTED DATA(ls_reported_i).
COMMIT ENTITIES.

" 3) interface extension 이 더한 action 실행
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE zz_setdefaultstatus
    FROM VALUE #( ( TravelID = '00000001' ) ( TravelID = '00000002' ) )
  FAILED ls_failed_i REPORTED ls_reported_i.
COMMIT ENTITIES.

" 4) projection 을 거쳐 → from_projection 이 채워진다. projection 에 있는 필드만 쓸 수 있다
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID )
    WITH VALUE #( ( %cid = 'cid3' TravelID = '00000003' AgencyID = '070001' ) )
  MAPPED DATA(ls_mapped_c) FAILED DATA(ls_failed_c) REPORTED DATA(ls_reported_c).
COMMIT ENTITIES.
```

## 알아두기

- 2단계는 RAP BO interface 를 거친 요청이라 `from_interface` 가 채워집니다. 4단계는 projection 을 거친 요청이라 `from_projection` 이 채워집니다.
- 3단계의 기록을 보면 extension behavior pool 의 메서드뿐 아니라 **base BO behavior pool 의 메서드도 불립니다.** 이때 `in_local_mode` 는 참입니다.
- 이 예제는 RAP BO 계약을 다 지키지는 않습니다. 특정 내용만 보이려고 일부러 짧게 만들었고, handler method 구현이 비어 있기도 합니다.

## 관련 항목

- [[abaprap_cl_abap_behv_aux]]
- [[abenrap_cl_abap_behv_aux_ph_abexa]]
- [[abenbdl_rap_bo_interface]]
- [[abenbdl_projection_bo]]
- [[abenbdl_extension]]
- [[abenbdl_using_interface]]
- [[abenbdl_extensible]]
