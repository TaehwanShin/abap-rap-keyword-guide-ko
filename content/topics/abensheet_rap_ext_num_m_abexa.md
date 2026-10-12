---
title: 예제 - EML 실전, external numbering 을 쓰는 managed RAP BO
summary: 키를 사용자가 직접 주는 managed RAP BO 하나로 생성·수정·삭제, action, validation, determination, association 을 거친 생성과 읽기, 동적 EML 까지 차례로 실행해 보는 종합 예제입니다.
keywords: ABAP EML in use, managed, 관리형, external numbering, 외부 번호 부여, MODIFY ENTITIES, READ ENTITIES, CREATE BY, EXECUTE, %cid, %cid_ref, %control, validation, determination, 검증, 결정, COMMIT ENTITIES, FAILED LATE, LINK, READ ENTITIES OPERATIONS, 동적 EML, 예제
---

## 설명

managed RAP BO 를 EML 로 다루는 방법을 한 번에 훑어보는 예제입니다. root entity(루트 엔터티)와 child entity(자식 엔터티)가 하나씩 있고, 키는 **external numbering**, 곧 RAP BO consumer(사용자)가 요청에 직접 넣는 값으로 정해집니다.

behavior definition(동작 정의)에는 standard operation(표준 작업) 말고도 action 하나, 저장 시점 validation 하나, 생성할 때 도는 저장 시점 determination 하나가 있습니다. 실행 클래스는 아래 내용을 차례로 실행합니다. 요청마다 일부러 실패하는 인스턴스를 하나씩 섞고, 끝난 뒤 DB 테이블 내용과 `mapped`, `failed`, `reported` 응답을 출력합니다.

| 차례 | 내용 | 눈여겨볼 점 |
| --- | --- | --- |
| 1 | 생성 | `FIELDS ( ... )` 목록에 없는 필드는 값을 줘도 저장되지 않습니다. determination 이 저장할 때 한 필드에 글자를 덧붙입니다. |
| 2 | 수정 | 같은 요청에서 만든 인스턴스를 `%cid_ref` 로 가리켜 바로 고칩니다. |
| 3 | 삭제 | `%cid_ref` 로도, 키로도 지웁니다. |
| 4 | action 실행 | 두 숫자 필드에 2 를 곱하는 action 입니다. |
| 5 | validation | 한 인스턴스가 validation 에 걸리면 그 요청의 인스턴스가 모두 저장되지 않습니다. |
| 6 | association 을 거친 생성 | 부모와 자식을 한 요청으로 만드는 deep create 입니다. |
| 7 | 읽기 | 루트 읽기, 자식 직접 읽기, 부모→자식 읽기, 자식→부모 읽기 |
| 8 | 곁들임: 동적 EML | `READ ENTITIES OPERATIONS` 로 읽기와 association 을 거친 읽기를 합니다. |

## 예제

behavior definition 입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }
  action doublePrice;
  validation validatePrice on save { field TotalPrice; }
  determination setDescription on save { create; }
  field ( readonly : update ) TravelID;   // 키는 생성할 때 사용자가 준다
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;
  field ( readonly : update ) BookingID;
  association _Travel;
}
```

RAP BO consumer 쪽 코드의 뼈대입니다.

```abap
" 생성: CurrencyCode 는 FIELDS 목록에 없어서 값을 줘도 저장되지 않는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID TotalPrice )
    WITH VALUE #( ( %cid = 'cid1' TravelID = '00000001' AgencyID = '070001'
                    TotalPrice = 100 CurrencyCode = 'EUR' ) )
  MAPPED DATA(ls_mapped) FAILED DATA(ls_failed) REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" 한 요청 안에서 만들고(%cid) → 고치고(%cid_ref) → action 실행
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID TotalPrice )
      WITH VALUE #( ( %cid = 'cid2' TravelID = '00000002' AgencyID = '070001' TotalPrice = 50 ) )
    UPDATE FIELDS ( AgencyID )
      WITH VALUE #( ( %cid_ref = 'cid2' AgencyID = '070002' ) )
    EXECUTE doublePrice
      FROM VALUE #( ( TravelID = '00000001' )     " 키로 가리킨다
                    ( TravelID = '99999999' ) )   " 없는 키: failed 에 담긴다
  MAPPED ls_mapped FAILED ls_failed REPORTED ls_reported.
COMMIT ENTITIES.

" deep create: 부모와 자식을 한 번에
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID )
      WITH VALUE #( ( %cid = 'cid3' TravelID = '00000003' AgencyID = '070001' ) )
    CREATE BY \_Booking FIELDS ( BookingID FlightDate )
      WITH VALUE #( ( %cid_ref = 'cid3'
                      %target  = VALUE #( ( %cid = 'cid3_1' BookingID = '0001'
                                            FlightDate = '20261201' ) ) ) )
  MAPPED ls_mapped FAILED ls_failed REPORTED ls_reported.

" validation 결과는 save sequence 의 응답으로 받는다
COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED DATA(ls_failed_late) REPORTED DATA(ls_reported_late).

" 읽기와 association 을 거친 읽기. LINK 로 부모-자식 키 짝도 받는다
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( TravelID = '00000001' ) )
    RESULT DATA(lt_travel)
    BY \_Booking ALL FIELDS WITH VALUE #( ( TravelID = '00000003' ) )
    RESULT DATA(lt_booking)
    LINK DATA(lt_link)
  FAILED DATA(ls_read_failed).

" 곁들임: 동적 EML 로 읽기
DATA: lt_read_in  TYPE TABLE FOR READ IMPORT zr_travel,
      lt_read_out TYPE TABLE FOR READ RESULT zr_travel.
lt_read_in = VALUE #( ( %key-TravelID = '00000001'
                        %control-TotalPrice = if_abap_behv=>mk-on ) ).
DATA(lt_ops) = VALUE abp_behv_retrievals_tab(
  ( op = if_abap_behv=>op-r-read entity_name = 'ZR_TRAVEL'
    instances = REF #( lt_read_in ) results = REF #( lt_read_out ) ) ).
READ ENTITIES OPERATIONS lt_ops.
```

## 알아두기

- **`FIELDS ( ... ) WITH` 와 `FROM`** : `FIELDS` 목록에서 뺀 필드는 `%control` 값이 `if_abap_behv=>mk-off` 가 됩니다. 그래서 인스턴스에 값을 적어도 저장되지 않고 초기값이 들어갑니다. `CREATE FROM` 꼴을 쓰면 `%control` 을 직접 on 으로 해 주어야 합니다. 삭제와 action 실행은 `FROM` 으로만 쓸 수 있습니다.
- **같은 키로 다시 생성** : DB 테이블에 같은 키가 이미 있으면 그 인스턴스는 저장되지 않습니다.
- **수정에서 뺀 필드** : `UPDATE FIELDS ( ... )` 목록에 없는 필드는 값을 적어도 바뀌지 않습니다.
- **validation 은 전부 아니면 전무** : 예제의 validation 은 숫자 필드가 1000 을 넘지 않아야 한다는 조건입니다. 세 인스턴스 가운데 하나가 걸리면 그 요청의 인스턴스는 하나도 DB 에 들어가지 않습니다. validation 의 응답은 `COMMIT ENTITIES` 문의 response parameter(응답 매개변수)에서만 받을 수 있습니다. 이때 타입은 `TYPE RESPONSE FOR ... LATE` 입니다.
- **읽기** : `ALL FIELDS WITH` 는 모든 필드를 읽고 모든 필드의 `%control` 을 on 으로 둡니다. `FIELDS ( ... ) WITH` 는 적은 필드만 그렇게 합니다. `RESULT` 는 꼭 적어야 합니다. child entity 는 `ENTITY` 뒤에 behavior definition 의 별칭을 적어 직접 읽을 수도 있습니다. association 을 거친 읽기에서 `LINK` 는 선택입니다.
- **응답 풀어 보기** : 예제는 `failed` 의 `%op`(어떤 작업이었는가)와 `%fail-cause`(실패 원인), `reported` 의 `%msg` 를 읽어 글로 바꿔 출력합니다. `%cid` 가 있으면 `%cid` 로, 없으면 키로 인스턴스를 가리킵니다.

## 관련 항목

- [[abensheet_rap_ext_num_u_abexa]]
- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_fields]]
- [[abapread_entity_entities]]
- [[abapread_entities_operations]]
- [[abapcommit_entities]]
- [[abapderived_types_cid_ref]]
- [[abenbdl_validations]]
- [[abenbdl_determinations]]
- [[abapeml_examples_abexas]]
