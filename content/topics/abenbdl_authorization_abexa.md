---
title: 예제 - global 권한 (global authorization)
summary: unmanaged RAP BO 에서 global 권한 확인을 정의하고 구현한 뒤, EML 로 수정과 삭제를 시도해 결과가 어떻게 갈리는지 보여 주는 예제입니다.
keywords: global authorization, authorization master ( global ), authorization dependent by, FOR GLOBAL AUTHORIZATION, 전역 권한, 권한 예제, 비관리형, unmanaged, REPORTED, 권한 종속 삭제
---

## 설명

unmanaged RAP BO 에 global 권한 확인을 걸고, 그것이 실제로 어떻게 작동하는지 보여 주는 예제입니다. 원문은 데모용 root entity(루트 엔터티)와 child entity(자식 엔터티)를 쓰지만, 여기서는 같은 내용을 `Travel` / `Booking` 으로 옮겨 적습니다.

구성은 다음과 같습니다.

- root entity `Travel` 은 **authorization master** 이고 global 권한(`global`)을 씁니다.
- child entity `Booking` 은 부모를 따르는 **authorization dependent** 입니다.
- behavior pool(동작 풀)의 global 권한 메서드는 일부러 단순하게 만들었습니다. **수정 요청은 언제나 허용**하고, **삭제 요청은 언제나 거부**하면서 `reported` 에 오류 메시지를 남깁니다.

실제 업무에서는 이렇게 무조건 허용하거나 거부하지 않습니다. 권한 객체처럼 인스턴스와 상관없는 기준으로 확인하도록 구현해야 합니다.

## 예제

behavior definition(동작 정의)입니다. 루트는 `authorization master ( global )`, 자식은 `authorization dependent by _Travel` 입니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( global )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;
  association _Travel { }
}
```

global 권한 메서드입니다. 요청받은 작업만 골라 허용 여부를 `result` 에 적습니다.

```abap
METHOD get_global_authorizations.
  " 수정 요청은 언제나 허용한다
  IF requested_authorizations-%update = if_abap_behv=>mk-on.
    result-%update = if_abap_behv=>auth-allowed.
  ENDIF.

  " 삭제 요청은 언제나 거부하고 오류 메시지를 남긴다
  IF requested_authorizations-%delete = if_abap_behv=>mk-on.
    result-%delete = if_abap_behv=>auth-unauthorized.
    APPEND VALUE #( %msg = new_message_with_text(
                             severity = if_abap_behv_message=>severity-error
                             text     = '삭제 권한이 없습니다.' ) )
           TO reported-travel.
  ENDIF.
ENDMETHOD.
```

BO 를 쓰는 쪽에서는 EML 로 수정과 삭제를 차례로 시도합니다.

```abap
" 1) 여행 두 건을 수정한다 → 허용된다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( status )
    WITH VALUE #( ( travelid = '00000001' status = 'A' )
                  ( travelid = '00000002' status = 'A' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" 2) 여행 한 건과 예약 한 건을 삭제하려 한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    DELETE FROM VALUE #( ( travelid = '00000003' ) )
  ENTITY booking
    DELETE FROM VALUE #( ( travelid = '00000001' bookingid = '0001' ) )
  FAILED ls_failed
  REPORTED ls_reported.

" 거부된 요청에 달린 메시지의 심각도를 꺼내 본다
LOOP AT ls_reported-travel INTO DATA(ls_message).
  DATA(lv_severity) = ls_message-%msg->m_severity.
ENDLOOP.

COMMIT ENTITIES.
```

## 알아두기

원문 프로그램은 먼저 부모 인스턴스 세 건과 자식 인스턴스 두 건을 만든 다음, 위 순서대로 실행하고 단계마다 테이블 내용을 `SELECT` 로 읽어 보여 줍니다. 결과는 이렇습니다.

- **부모 수정** : 두 건 모두 바뀝니다. 수정은 권한이 허용되기 때문입니다.
- **부모 삭제** : 실패합니다. 삭제 권한이 거부되고 오류 메시지가 돌아옵니다.
- **자식 삭제** : 성공합니다. 이 예제에서 가장 눈여겨볼 대목입니다.

자식 삭제가 성공하는 까닭은 이렇습니다. authorization dependent entity(엔터티)에 온 삭제 요청은 authorization master entity 로 넘어갑니다. 이 예제에서는 authorization master 가 곧 parent entity(부모 엔터티)입니다. 그리고 그 요청은 authorization master 를 **수정하는 요청**으로 풀이됩니다. 수정은 허용되어 있으므로 자식 인스턴스 삭제는 통과합니다.

곧 "부모는 지울 수 없지만 자식은 지울 수 있는" 결과가 나옵니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abaphandler_meth_global_auth]]
- [[abapeml_response]]
